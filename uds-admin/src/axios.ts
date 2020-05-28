import axios from "axios";
import store from "./store";
import {popup_snack} from "./actions";

axios.defaults.baseURL = process.env.REACT_APP_API;
axios.defaults.headers['x-request-client'] = 'WEB_APP';
axios.interceptors.response.use((response) => {
	console.log('Response was received', response);
	if (response.data.error_code !== 0) {
		store.dispatch(popup_snack(response.data.message));
	}
	return response;
}, error => {
	// handle the response error
	return Promise.reject(error);
});