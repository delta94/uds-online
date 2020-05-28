import axios from "axios";
import store from "./store";
import {popup_snack} from "./actions";

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
axios.interceptors.response.use((response) => {
	console.log('Response was received', response);
	if (response.data.error_code !== 0) {
		store.dispatch(popup_snack(response.data.message));
	}
	return response;
}, error => {
	// handle the response error
	store.dispatch(popup_snack(error.message));
	return Promise.reject(error);
});