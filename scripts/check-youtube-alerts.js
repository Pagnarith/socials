#!/usr/bin/env node
import dotenv from 'dotenv';
import { createBot } from '../telegram-bot/src/createBot.js';
import { checkAndSendLatestYouTubeAlert } from '../telegram-bot/src/scheduler.js';
import {
	hasVideoBeenAlerted,
	loadAlertState,
	recordAlertedVideo,
	saveAlertState
} from './lib/youtube-alert-state.js';
import fs from 'fs';

dotenv.config();

const bot = createBot();
let state = await loadAlertState();

const result = await checkAndSendLatestYouTubeAlert(bot, {
	isAlreadyAlerted: async (alert) => hasVideoBeenAlerted(state, alert),
	markAlertSent: async (alert) => {
		state = await recordAlertedVideo(state, alert);
	}
});

if (result.sent) {
	await saveAlertState(state);
}

const resultFile = process.env.YOUTUBE_ALERT_RESULT_FILE;
if (resultFile) {
	fs.writeFileSync(resultFile, JSON.stringify({ result, state }, null, 2));
}

console.log(JSON.stringify(result));
