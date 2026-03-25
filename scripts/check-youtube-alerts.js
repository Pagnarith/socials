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

dotenv.config();

const bot = createBot();
let state = await loadAlertState();

const result = await checkAndSendLatestYouTubeAlert(bot, {
	isAlreadyAlerted: async (videoId) => hasVideoBeenAlerted(state, videoId),
	markAlertSent: async (alert) => {
		state = recordAlertedVideo(state, alert);
	}
});

if (result.sent) {
	await saveAlertState(state);
}

console.log(JSON.stringify(result));
