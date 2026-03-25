import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const msalConfig = {
  auth: {
    clientId: process.env.DATAVERSE_CLIENT_ID,
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.DATAVERSE_TENANT_ID}`,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);
const dataverseUrl = process.env.DATAVERSE_URL;

async function getAccessToken() {
  const result = await cca.acquireTokenByClientCredential({
    scopes: [`${dataverseUrl}/.default`],
  });
  return result.accessToken;
}

async function dataverseRequest(method, endpoint, body = null) {
  const token = await getAccessToken();
  const url = `${dataverseUrl}/api/data/v9.2/${endpoint}`;

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dataverse API error (${response.status}): ${error}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ============ Video Content Management ============

export async function createVideoRecord(video) {
  return dataverseRequest('POST', 'cr_videocontents', {
    cr_title: video.title,
    cr_description: video.description,
    cr_platform: video.platform, // youtube, tiktok, facebook
    cr_category: video.category, // minecraft, rhino3d
    cr_status: video.status || 'draft', // draft, scheduled, published
    cr_scheduleddate: video.scheduledDate,
    cr_publisheddate: video.publishedDate,
    cr_videourl: video.videoUrl,
    cr_thumbnailurl: video.thumbnailUrl,
    cr_views: 0,
    cr_likes: 0,
    cr_comments: 0,
  });
}

export async function getVideos(filter = '') {
  const endpoint = filter
    ? `cr_videocontents?$filter=${encodeURIComponent(filter)}&$orderby=cr_scheduleddate desc`
    : 'cr_videocontents?$orderby=cr_scheduleddate desc';
  return dataverseRequest('GET', endpoint);
}

export async function updateVideoStats(videoId, stats) {
  return dataverseRequest('PATCH', `cr_videocontents(${videoId})`, {
    cr_views: stats.views,
    cr_likes: stats.likes,
    cr_comments: stats.comments,
  });
}

// ============ Subscriber Management ============

export async function createSubscriber(subscriber) {
  return dataverseRequest('POST', 'cr_subscribers', {
    cr_telegramid: subscriber.telegramId,
    cr_name: subscriber.name,
    cr_username: subscriber.username,
    cr_subscribedat: new Date().toISOString(),
    cr_isactive: true,
    cr_notifymcrelease: subscriber.notifyMinecraft || false,
    cr_notifynewvideo: subscriber.notifyVideo || true,
  });
}

export async function getActiveSubscribers() {
  return dataverseRequest('GET', "cr_subscribers?$filter=cr_isactive eq true");
}

export async function updateSubscriber(subscriberId, data) {
  return dataverseRequest('PATCH', `cr_subscribers(${subscriberId})`, data);
}

// ============ Revenue Tracking ============

export async function createRevenueEntry(entry) {
  return dataverseRequest('POST', 'cr_revenues', {
    cr_platform: entry.platform,
    cr_source: entry.source, // ads, membership, sponsorship, marketplace
    cr_amount: entry.amount,
    cr_currency: entry.currency || 'USD',
    cr_date: entry.date,
    cr_description: entry.description,
  });
}

export async function getRevenue(startDate, endDate) {
  const filter = `cr_date ge ${startDate} and cr_date le ${endDate}`;
  return dataverseRequest('GET', `cr_revenues?$filter=${encodeURIComponent(filter)}&$orderby=cr_date desc`);
}

export async function getRevenueSummary() {
  return dataverseRequest('GET', 'cr_revenues?$apply=groupby((cr_platform),aggregate(cr_amount with sum as total))');
}

// ============ Analytics Snapshots ============

export async function saveAnalyticsSnapshot(snapshot) {
  return dataverseRequest('POST', 'cr_analyticssnapshots', {
    cr_platform: snapshot.platform,
    cr_date: new Date().toISOString(),
    cr_followers: snapshot.followers,
    cr_totalviews: snapshot.totalViews,
    cr_engagementrate: snapshot.engagementRate,
    cr_watchhours: snapshot.watchHours,
    cr_revenue: snapshot.revenue,
  });
}

export async function getAnalyticsHistory(platform, limit = 30) {
  return dataverseRequest('GET',
    `cr_analyticssnapshots?$filter=cr_platform eq '${platform}'&$orderby=cr_date desc&$top=${limit}`
  );
}

// ============ Content Schedule ============

export async function createScheduleEntry(entry) {
  return dataverseRequest('POST', 'cr_contentschedule', {
    cr_title: entry.title,
    cr_platform: entry.platform,
    cr_category: entry.category,
    cr_scheduleddate: entry.scheduledDate,
    cr_status: entry.status || 'planned', // planned, in-progress, recorded, edited, published
    cr_notes: entry.notes,
  });
}

export async function getUpcomingSchedule(days = 7) {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const filter = `cr_scheduleddate ge ${now} and cr_scheduleddate le ${future}`;
  return dataverseRequest('GET',
    `cr_contentschedule?$filter=${encodeURIComponent(filter)}&$orderby=cr_scheduleddate asc`
  );
}

export default {
  createVideoRecord,
  getVideos,
  updateVideoStats,
  createSubscriber,
  getActiveSubscribers,
  updateSubscriber,
  createRevenueEntry,
  getRevenue,
  getRevenueSummary,
  saveAnalyticsSnapshot,
  getAnalyticsHistory,
  createScheduleEntry,
  getUpcomingSchedule,
};
