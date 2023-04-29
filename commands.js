import Keyboards from "./keyboards.js";
import API from "../api/api.js";
import Service from "./service.js";
import { bot } from "./index.js";

let api = new API('https://rezka.ag/series/comedy/1154-teoriya-bolshogo-vzryva-2007.html');
const keyboards = new Keyboards();
const service = new Service();

class Commands {
	constructor() {
		this.state = null;
	}
	
    init = async (chatId) => {
		this.state = 'init';
        await bot.sendMessage(chatId, 'Welcome', keyboards.main)
    }

	rezka = async (chatId) => {
		this.state = 'rezka';
		await bot.sendMessage(chatId, 'Choose action', keyboards.rezka)
	}

    find = async (chatId) => {
		this.state = 'find';
        await bot.sendMessage(chatId, 'Enter hdrezka movie/series name', keyboards.findKeyboard);
		// await bot.sendMessage(chatId, 'text', keyboards.findInlineKeyboard);
    }

    findByURL = async (chatId) => {
		this.state = 'findByURL';
		
		await bot.sendMessage(chatId, 'Enter hdrezka link to movie/series', keyboards.findByURL);

		const procedure = async (msg) => {
			if (this.state === 'findByURL') {
				const regex = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
				if (regex.test(msg.text)) {
					bot.sendMessage(chatId, "I'm checking URL...");

					api = new API(msg.text)
					const isValid = await service.checkURL(api, chatId);

					if (isValid) {
						const type = await api.type();

						if (type === 'video.movie') {
							const translations = Object.keys(await api.translations());
							const videos = await api.video();
							const name = await api.name();

							await bot.sendMessage(chatId, name, await keyboards.displayMovie(translations, videos, name, api));
						} else if (type === 'video.tv_series') {
							const translations = Object.keys(await api.translations());
							const seasons = await api.seasons();
							const seriesInit = service.checkSeriesInit(seasons);
							const {initSe, initEp} = seriesInit
							const name = await api.name();
							const videos = await api.video(initSe, initEp);

							await bot.sendMessage(chatId, name, await keyboards.displaySeries(translations, videos, name, api, seasons));
						}
					} else {
						return service.logError(chatId);
					}
				} else {
					bot.sendMessage(chatId, "Invalid URL");
				}
			} else {
				bot.off('message', procedure);
				return;
			}
		}
		
		bot.on('message', procedure);
    }

	backToMainMenu = async (chatId) => {
		this.state = 'backToMainMenu';
		return await this.init(chatId);
	}

	backToSearch = async (chatId) => {
		this.state = 'backToSearch';
		return await this.rezka(chatId);
	}
}

export default Commands;