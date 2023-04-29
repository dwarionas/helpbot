import TelegramBot from 'node-telegram-bot-api';
import Commands from './commands.js';
import Controller from './controller.js';

const bot = new TelegramBot(process.env.TG_TOKEN, {polling: true});
const cmd = new Commands(bot);


function Build() {
    bot.setMyCommands([
        {command: '/start', description: 'Start bot / Reload keyboard'},
    ])
    
    Controller();
}

export  { bot, cmd };
export default Build;