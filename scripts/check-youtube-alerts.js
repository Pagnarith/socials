#!/usr/bin/env node
import dotenv from 'dotenv';
import { createBot } from '../telegram-bot/src/createBot.js';
import { checkAndSendLatestYouTubeAlert } from '../telegram-bot/src/scheduler.js';

dotenv.config();

const bot = createBot();

const result = await checkAndSendLatestYouTubeAlert(bot);
console.log(JSON.stringify(result));
