import { bot, cmd } from "./index.js";

function Controller() {
    bot.on('message', async (msg) => {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const text = msg.text;

        switch (text) {
            case '/start':
                cmd.init(chatId);
                break;
    
            case 'Find': 
                cmd.find(chatId);
                break;
    
            case 'Find by url':
                cmd.findByURL(chatId);
                break;
            
            case 'Back to main menu':
                cmd.backToMainMenu(chatId);
                break;

            case 'Use Client':
                cmd.rezka(chatId);
                break;
            
            case 'Back to search':
                cmd.backToSearch(chatId);
                break;
        }
    });
}

export default Controller;