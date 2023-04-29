import { bot } from "./index.js";

class Service {
    constructor() {
        this.name = null;
    }

    checkURL = async (api, chatId) => {
        const isBlocked = await api.isBlocked();
        const type = await api.type();
        if (!type) return this.logError(chatId);
        if (isBlocked) return this.logError(chatId);

        const seasonsToCheck = type === 'video.tv_series' ? await api.seasons() : null;
        const se = type == 'video.tv_series' ? Object.keys(Object.values(seasonsToCheck)[0].seasons)[0] : null;
        const ep = type == 'video.tv_series' ? Object.keys(Object.values(Object.values(seasonsToCheck)[0].episodes)[0])[0] : null;
        const tr = type == 'video.tv_series' ? Object.keys(seasonsToCheck)[0] : null;
        return await api.video(se, ep, tr);
    }

    logError = (chatId) => bot.sendMessage(chatId, "Something went wrong. Check the URL and try again. Possible reasons: content is blocked in your coutry | you use unofficial hdrezka site");

    checkSeriesInit = (seasons) => {
        const initSe = Object.keys(Object.values(seasons)[0].seasons)[0];
        const initEp = Object.keys(Object.values(Object.values(seasons)[0].episodes)[0])[0];
        return {initSe, initEp};
    }

    seriesMarkup = (translations, tr, re, trIndex) => {
        if (tr === 'HDrezka Studio ') {
            tr = 'HDrezka Studio 🇺🇦'
        } else if (tr.includes('(+субтитры)')) {
            const index = tr.indexOf('(+субтитры)');
            tr = tr.slice(0, index)
        }

        return {
            inline_keyboard: [
                tr ? [
                    { text: tr, callback_data: tr },
                ] : [],
                tr ? [
                    { text: '←', callback_data: 'trSeriesPrev' },
                    { text: `${trIndex + 1} / ${translations.length}`, callback_data: 'smth' },
                    { text: '→', callback_data: 'trSeriesNext' }
                ] : [],
                [
                    { text: '←', callback_data: 'reSeriesPrev' },
                    { text: re, callback_data: 'smth' },
                    { text: '→', callback_data: 'reSeriesNext' }
                ],
                [
                    {text: 'Next →', callback_data: 'seriesNext'}
                ],
            ],
        }
    }

    seriesSecondScreen = (se, seasonsCount, ep, episodesCount) => {
        return {
            inline_keyboard: [
                [
                    {text: '←', callback_data: 'seSeriesPrev'},
                    {text: `SE: ${se} / ${seasonsCount.at(-1)}`, callback_data: 'se'},
                    {text: '→', callback_data: 'seSeriesNext'}
                ],
                [
                    {text: '←', callback_data: 'epSeriesPrev'},
                    {text: `EP: ${ep} / ${episodesCount.at(-1)}`, callback_data: 'se'},
                    {text: '→', callback_data: 'epSeriesNext'}
                ],
                [
                    {text: 'Next →', callback_data: 'seriesNextToDone'}
                ],
                [
                    { text: '← Back', callback_data: 'seriesBackToTR' },
                ]
            ],
        }
    }

    seriesPaginator = async (translations, videos, name, api, seasons) => {
        this.name = name;
        
        const resols = Object.keys(videos).reverse();
        let re = resols[0];
        let reIndex = 0
        let oldRe = re;
        let oldReIndex = reIndex;

        let tr = translations[0];
        let trIndex = 0;
        let oldTr = tr;
        let oldTrIndex = trIndex;

        const { initSe, initEp } = this.checkSeriesInit(seasons);
        let seasonsCount = Object.keys(Object.values(seasons)[0].seasons).map(Number);
        let episodesCount = Object.keys(Object.values(Object.values(seasons)[0].episodes)[0]).map(Number);
        let se = initSe;
        let ep = initEp;
        let seIndex = 0;
        let epIndex = 0;

        const handler = async (query) => {
            if (this.name == name) {
                const message = query.message;
                const answer = query.data;
        
                if (answer === 'trSeriesPrev') {
                    trIndex = (trIndex - 1 + translations.length) % translations.length;
                } else if (answer === 'trSeriesNext') {
                    trIndex = (trIndex + 1) % translations.length;
                }

                if (answer === 'reSeriesPrev') {
                    reIndex = (reIndex - 1 + resols.length) % resols.length;
                } else if (answer === 'reSeriesNext') {
                    reIndex = (reIndex + 1) % resols.length;
                }

                if (answer === 'seSeriesPrev') {
                    seIndex = (seIndex - 1 + seasonsCount.length) % seasonsCount.length
                } else if (answer === 'seSeriesNext') {
                    seIndex = (seIndex + 1) % seasonsCount.length
                }

                if (answer === 'epSeriesPrev') {
                    epIndex = (epIndex - 1 + episodesCount.length) % episodesCount.length
                } else if (answer === 'epSeriesNext') {
                    epIndex = (epIndex + 1) % episodesCount.length
                }
        
                tr = translations[trIndex];
                re = resols[reIndex];

                se = seasonsCount[seIndex];
                ep = episodesCount[epIndex];

                seasonsCount = Object.keys(seasons[tr].seasons).map(Number)
                episodesCount = Object.keys(seasons[tr].episodes[se]).map(Number);

                if (answer === 'seriesNext' || 
                    answer === 'epSeriesPrev' || 
                    answer === 'epSeriesNext' || 
                    answer === 'seSeriesPrev' || 
                    answer === 'seSeriesNext') {
                    bot.editMessageReplyMarkup(this.seriesSecondScreen(se, seasonsCount, ep, episodesCount), {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
                } else if (answer === 'seriesBackToTR') {
                    bot.editMessageReplyMarkup(this.seriesMarkup(translations, tr, re, trIndex), {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
                } else if (answer === 'seriesNextToDone') {
                    const vid = await api.video(se, ep, tr);
                    
                    bot.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                { text: 'Download', url: vid[re].concat('?dn=' + name + re + '.mp4')},
                                { text: 'Watch', web_app: {url: vid[re]} },
                            ],
                            [
                                { text: '← Back', callback_data: 'seriesNext' },
                            ]
                        ],
                    }, {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
                }

                if (tr !== oldTr || trIndex !== oldTrIndex || re !== oldRe || reIndex !== oldReIndex) {
                    bot.editMessageReplyMarkup(this.seriesMarkup(translations, tr, re, trIndex), {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
        
                    oldTr = tr;
                    oldTrIndex = trIndex;

                    oldRe = re;
                    oldReIndex = reIndex;
                }
            } else {
                bot.off('callback_query', handler);
            }
        }
    
        bot.on('callback_query', handler);

        return {tr, re, trIndex};
    }

    movieMarkup = (translations, tr, re, trIndex) => {
        if (tr === 'HDrezka Studio ') {
            tr = 'HDrezka Studio 🇺🇦'
        } else if (tr.includes('(+субтитры)')) {
            const index = tr.indexOf('(+субтитры)');
            tr = tr.slice(0, index)
        }

        return {
            inline_keyboard: [
                tr ? [
                    { text: tr, callback_data: tr },
                ] : [],
                tr ? [
                    { text: '←', callback_data: 'trMoviePrev' },
                    { text: `${trIndex + 1} / ${translations.length}`, callback_data: 'smth' },
                    { text: '→', callback_data: 'trMovieNext' }
                ] : [],
                [
                    { text: '←', callback_data: 'reMoviePrev' },
                    { text: re, callback_data: 'smth' },
                    { text: '→', callback_data: 'reMovieNext' }
                ],
                [
                    {text: 'Next →', callback_data: 'movieNext'}
                ],
            ],
        }
    }

    moviePaginator = async (translations, videos, name, api) => {
        this.name = name;
        
        const resols = Object.keys(videos).reverse();
        let re = resols[0];
        let reIndex = 0
        let oldRe = re;
        let oldReIndex = reIndex;

        let tr = translations[0];
        let trIndex = 0;
        let oldTr = tr;
        let oldTrIndex = trIndex;

        const handler = async (query) => {
            if (this.name == name) {
                const message = query.message;
                const answer = query.data;
        
                if (answer === 'trMoviePrev') {
                    trIndex = (trIndex - 1 + translations.length) % translations.length;
                } else if (answer === 'trMovieNext') {
                    trIndex = (trIndex + 1) % translations.length;
                }

                if (answer === 'reMoviePrev') {
                    reIndex = (reIndex - 1 + resols.length) % resols.length;
                } else if (answer === 'reMovieNext') {
                    reIndex = (reIndex + 1) % resols.length;
                }
        
                tr = translations[trIndex];
                re = resols[reIndex];
                
                if (answer === 'movieNext') {
                    const vid = await api.video(null, null, tr);
                    
                    bot.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                { text: 'Download', url: vid[re].concat('?dn=' + name + re + '.mp4')},
                                { text: 'Watch', web_app: {url: vid[re]} },
                            ],
                            [
                                { text: '← Back', callback_data: 'movieBack' },
                            ]
                        ],
                    }, {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
                } else if (answer === 'movieBack') {
                    bot.editMessageReplyMarkup(this.movieMarkup(translations, tr, re, trIndex), {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
                }

                if (tr !== oldTr || trIndex !== oldTrIndex || re !== oldRe || reIndex !== oldReIndex) {
                    bot.editMessageReplyMarkup(this.movieMarkup(translations, tr, re, trIndex), {
                        chat_id: message.chat.id,
                        message_id: message.message_id,
                    });
        
                    oldTr = tr;
                    oldTrIndex = trIndex;

                    oldRe = re;
                    oldReIndex = reIndex;
                }
            } else {
                bot.off('callback_query', handler);
            }
        }
    
        bot.on('callback_query', handler);

        return {tr, re, trIndex};
    }
}

export default Service;

