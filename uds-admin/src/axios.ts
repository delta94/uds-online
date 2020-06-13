import axios, {AxiosError} from "axios";
import store from "./store";
import {popup_snack} from "./actions";
import {IAPIResponseData} from "./helpers/api";

axios.defaults.baseURL = process.env.REACT_APP_API;
axios.defaults.headers['x-request-client'] = 'WEB_APP';
/**
 * Modify all outgoing requests.
 */
axios.interceptors.request.use(
	(config) => {
		const token = store.getState().auth.token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	error => Promise.reject(error)
);

/**
 * Here we process all the responses.
 */
axios.interceptors.response.use(
	(response: IAPIResponseData): any => {
		if (response.data.error_code !== 0) {
			store.dispatch(popup_snack(response.data.message));
			return Promise.reject(response.data.message);
		}
		return response.data.payload;
	},
	(error: AxiosError) => {
		// handle the response error
		let msg = error.message;
		if (error.isAxiosError && error.response) {
			msg = error.response.data.message;
		}
		store.dispatch(popup_snack(msg));
		return Promise.reject(error);
	}
);