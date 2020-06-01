import axios, {AxiosError} from "axios";
import store from "./store";
import {popup_snack} from "./actions";
import {IAPIResponseData} from "./helpers/api";

axios.defaults.baseURL = process.env.REACT_APP_API;
axios.defaults.headers['x-request-client'] = 'WEB_APP';
axios.interceptors.request.use(
	config => {
		const token = store.getState().auth.token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	error => Promise.reject(error)
);
axios.interceptors.response.use(
	(response: IAPIResponseData): any => {
		console.log('Response was received', response);
		if (response.data.error_code !== 0) {
			store.dispatch(popup_snack(response.data.message));
			return Promise.reject(response.data.message);
		}
		return response.data.payload;
	},
	(error: AxiosError)=> {
		// handle the response error
		const msg = error.response && error.response.data.message ? error.response.data.message: error.message;
		store.dispatch(popup_snack(msg));
		return Promise.reject(error);
	}
);