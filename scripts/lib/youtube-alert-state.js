const DEFAULT_STATE_NAME = 'YOUTUBE_ALERT_STATE';
const MAX_TRACKED_VIDEOS = 50;

function parseRepositorySlug() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || !repository.includes('/')) {
    throw new Error('Missing GITHUB_REPOSITORY');
  }

  const [owner, repo] = repository.split('/');
  return { owner, repo };
}

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN');
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
      .filter((item) => item && typeof item.videoId === 'string')
      .slice(0, MAX_TRACKED_VIDEOS)
  };
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

export function hasVideoBeenAlerted(state, videoId) {
  return state.videos.some((item) => item.videoId === videoId);
}

export function recordAlertedVideo(state, alert) {
  const nextVideos = [
    {
      videoId: alert.videoId,
      title: alert.title,
      url: alert.url,
      publishedAt: alert.publishedAt,
      alertedAt: new Date().toISOString()
    },
    ...state.videos.filter((item) => item.videoId !== alert.videoId)
  ].slice(0, MAX_TRACKED_VIDEOS);

  return { videos: nextVideos };
}
