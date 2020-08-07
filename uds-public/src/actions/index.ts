import {AnyAction, Dispatch} from "redux";
import {decode as jwtDecode} from "jsonwebtoken";
import {CLOSE_MESSAGE, EXIT_MESSAGE, LOG_IN, LOG_OUT, SHOW_POPUP_MESSAGE} from "./types";
import {IAuthRequest, IRegisterRequest, ITokenPayload} from "../reducers/authReducer";
import {api_request} from "../helpers/api";
import history from "../history";
import {ROUTES} from "../constants";

export const log_in = (token: string, userID: string): AnyAction => {
	return {
		type: LOG_IN,
		payload: {token, userID}
	}
};

export const log_out = (): AnyAction => {
	history.push(ROUTES.LOGIN);
	return {
		type: LOG_OUT,
	}
};

export const close_message = (reason: string): AnyAction => {
	return {
		type: CLOSE_MESSAGE,
		payload: reason
	};
};

export const exit_message = (): AnyAction => {
	return {
		type: EXIT_MESSAGE
	};
};
export const popup_snack = (message: string): AnyAction => {
	return {
		type: SHOW_POPUP_MESSAGE,
		payload: message
	}
};

export const issue_password_reset = (email: string) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "POST",
			url: 'issue-password-reset',
			data: {email},
			version: 1
		})
	}
}
export const reset_password = (password: string, confirmation: string, token: string, callback?: (arg0: number) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<null>({
			method: "POST",
			url: 'accounts/reset-password',
			data: {
				password, confirmation, token
			},
			version: 1
		})
			.then((response) => {
				if (callback) callback(0);
			})
	}
}

export const register_user = (request: IRegisterRequest, recaptchaToken: string) => {
	interface IRegisterResponse {
		email: string,
		id: string,
	}
	return (dispatch: Dispatch) => {
		return api_request<IRegisterResponse>({
			method: "POST",
			url: `register`,
			data: request,
			headers: {
				'x-recaptcha-token': recaptchaToken
			},
			version: 1
		})
			.then(() => {
			
			});
	};
};

/**
 * Sends a POST request to authenticate the user. Used to obtain JSON Web Token.
 *
 * @param email
 * @param password
 */
export const authenticate = (email: string, password: string) => {
	interface AuthResponse {
		token: string
	}
	const data: IAuthRequest = {
		email,
		password: {
			value: password
		}
	}
	return (dispatch: Dispatch) => {
		return api_request<AuthResponse>({
			method: "POST",
			url: `authenticate`,
			data,
			version: 1
		})
			.then(({token}) => {
				const decoded = jwtDecode(token) as JsonWebKey;
				const {iss} = decoded as ITokenPayload;
				dispatch(log_in(token, iss));
			})
	};
};