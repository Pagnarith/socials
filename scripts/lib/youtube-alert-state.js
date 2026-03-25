const DEFAULT_STATE_NAME = 'YOUTUBE_ALERT_STATE';
const MAX_TRACKED_VIDEOS = 50;

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

function parseRepositorySlug() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || !repository.includes('/')) {
    throw new Error('Missing GITHUB_REPOSITORY');
  }

  const [owner, repo] = repository.split('/');
  return { owner, repo };
}

function getHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_REPO_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN or GH_REPO_TOKEN');
  }

  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'socials-youtube-alerts'
  };
}

function getVariableName() {
  return process.env.YOUTUBE_ALERT_STATE_NAME || DEFAULT_STATE_NAME;
}

function normalizeState(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { videos: [] };
  }

  const videos = Array.isArray(parsed.videos) ? parsed.videos : [];
  return {
    videos: videos
      .filter((item) => item && (typeof item.videoId === 'string' || typeof item.dedupeKey === 'string'))
      .map((item) => ({
        videoId: item.videoId || null,
        dedupeKey: item.dedupeKey || null,
        title: item.title || null,
        url: item.url || null,
        publishedAt: item.publishedAt || null,
        alertedAt: item.alertedAt || null
      }))
      .slice(0, MAX_TRACKED_VIDEOS)
  };
}

export async function createAlertDedupeKey(alert) {
  return sha256(`${alert.title || ''}::${alert.publishedAt || ''}`);
}

export async function loadAlertState() {
  const { owner, repo } = parseRepositorySlug();
  const name = getVariableName();
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/variables/${name}`, {
    headers: getHeaders()
  });

  if (response.status === 404) {
    return { videos: [] };
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to load GitHub variable ${name}: ${error}`);
  }

  const data = await response.json();

  try {
    return normalizeState(JSON.parse(data.value));
  } catch {
    return { videos: [] };
  }
}

export async function saveAlertState(state) {
  const { owner, repo } = parseRepositorySlug();
  const name = getVariableName();
  const normalized = normalizeState(state);
  const value = JSON.stringify({
    videos: normalized.videos.slice(0, MAX_TRACKED_VIDEOS)
  });
  const headers = {
    ...getHeaders(),
    'Content-Type': 'application/json'
  };

  const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/variables/${name}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ name, value })
  });

  if (updateResponse.status === 404) {
    const createResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/variables`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, value })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create GitHub variable ${name}: ${error}`);
    }
    return;
  }

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to update GitHub variable ${name}: ${error}`);
  }
}

export async function hasVideoBeenAlerted(state, alert) {
  const dedupeKey = await createAlertDedupeKey(alert);

  return state.videos.some((item) => {
    return (alert.videoId && item.videoId === alert.videoId) || item.dedupeKey === dedupeKey;
  });
}

export async function recordAlertedVideo(state, alert) {
  const dedupeKey = await createAlertDedupeKey(alert);
  const nextVideos = [
    {
      videoId: alert.videoId,
      dedupeKey,
      title: alert.title,
      url: alert.url,
      publishedAt: alert.publishedAt,
      alertedAt: new Date().toISOString()
    },
    ...state.videos.filter((item) => item.videoId !== alert.videoId && item.dedupeKey !== dedupeKey)
  ].slice(0, MAX_TRACKED_VIDEOS);

  return { videos: nextVideos };
}
