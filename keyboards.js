import { bot } from "./index.js"
import Service from "./service.js"

const service = new Service();

class Keyboards {
	main = {
		reply_markup: {
			keyboard: [
				[{text: 'Use Client'}],
				[{text: 'Series notifier'}]
			],
			resize_keyboard: true
		}
		}

		rezka = {
			reply_markup: {
				keyboard: [
					[
						{text: 'Find'},
						{text: 'Find by url'},
					],
					[
						{text: 'Back to main menu'},
					]
				],
				resize_keyboard: true
			}
		}

		notifier = {
			reply_markup: {
				keyboard: [
					[
							{text: 'ssgs'},
							{text: 'shshhh'},
					],
					[
						{text: 'Back to main menu'},
					]
				],
				resize_keyboard: true
			}
		}

		findKeyboard = {
			reply_markup: {
				keyboard: [
					[
						{text: 'Back to search'},
					]
				],
				resize_keyboard: true
			}
		}

		findByURL = {
			reply_markup: {
				keyboard: [
					[
						{text: 'Back to search'},
					]
				],
				resize_keyboard: true
			}
		}

		displayMovie = async (translations, videos, name, api) => {
			const {tr, re, trIndex} = await service.moviePaginator(translations, videos, name, api);
		
			return {
				reply_markup: service.movieMarkup(translations, tr, re, trIndex)
			};
		};

		displaySeries = async (translations, videos, name, api, seasons) => {
			const {tr, re, trIndex} = await service.seriesPaginator(translations, videos, name, api, seasons)

			return {
				reply_markup: service.seriesMarkup(translations, tr, re, trIndex)
			};
		}
}

export default Keyboards;
