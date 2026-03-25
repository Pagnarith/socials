#!/usr/bin/env node
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.GITHUB_TOKEN || process.env.GH_REPO_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.YOUTUBE_ALERT_SUMMARY_ISSUE_NUMBER;
const discussionId = process.env.YOUTUBE_ALERT_SUMMARY_DISCUSSION_ID;
const resultFile = process.env.YOUTUBE_ALERT_RESULT_FILE;

if (!issueNumber && !discussionId) {
  console.log('No summary target configured. Skipping comment post.');
  process.exit(0);
}

if (!token) {
  throw new Error('Missing GITHUB_TOKEN or GH_REPO_TOKEN');
}

if (!repository || !repository.includes('/')) {
  throw new Error('Missing GITHUB_REPOSITORY');
}

if (!resultFile || !fs.existsSync(resultFile)) {
  throw new Error('Missing YOUTUBE_ALERT_RESULT_FILE or result file does not exist');
}

const [owner, repo] = repository.split('/');
const payload = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
const result = payload.result || {};
const state = payload.state || { videos: [] };
const latest = state.videos.slice(0, 3);
const runUrl = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null;

const latestBlock = latest.length
  ? latest
      .map((item) => `- ${item.title || '(untitled)'} (${item.videoId || 'no-id'})`)
      .join('\n')
  : '- No tracked videos yet';

const body = [
  'YouTube alert workflow summary',
  '',
  `- Alerts sent: ${result.count ?? 0}`,
  `- Uploads found in window: ${result.found ?? result.count ?? 0}`,
  `- Triggered send: ${result.sent ? 'yes' : 'no'}`,
  runUrl ? `- Workflow run: ${runUrl}` : null,
  '',
  'Latest tracked videos:',
  latestBlock
].filter(Boolean).join('\n');

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'User-Agent': 'socials-youtube-alerts'
};

if (issueNumber) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post issue comment: ${error}`);
  }

  console.log(`Posted YouTube alert summary to issue #${issueNumber}`);
  process.exit(0);
}

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    query: `mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
      addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
        comment {
          id
        }
      }
    }`,
    variables: {
      discussionId,
      body
    }
  })
});

const data = await response.json();

if (!response.ok || data.errors) {
  throw new Error(`Failed to post discussion comment: ${JSON.stringify(data.errors || data)}`);
}

console.log(`Posted YouTube alert summary to discussion ${discussionId}`);
