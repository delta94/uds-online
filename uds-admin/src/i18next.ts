import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const translationRU = require("./i18/ru.json");

i18n
	.use(initReactI18next)
	.init({
		resources: {
			ru: {
				translation: translationRU
			},
		},
		lng: "ru",
		fallbackLng: "ru",
		interpolation: {
			escapeValue: false
		}
	});
