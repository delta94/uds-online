import {AnyAction, Dispatch} from "redux";
import {decode as jwtDecode} from "jsonwebtoken";
import {CLOSE_MESSAGE, EXIT_MESSAGE, LOG_IN, LOG_OUT, SET_USERS, SHOW_POPUP_MESSAGE} from "./types";
import {IAuthRequest, ILoginPayload, ITokenPayload} from "../reducers/authReducer";
import {api_request} from "../helpers/api";
import {IUser} from "../reducers/usersReducer";
import {IAction, IPaginatablePayload} from "../helpers/models";
import history from "../history";
import {ROUTES} from "../constants";

export const log_in = (token: string, userID: string, role: number): IAction<ILoginPayload> => {
	return {
		type: LOG_IN,
		payload: {token, userID, role}
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

export const set_users = (users: IUser[], page: number, total: number, size: number): IAction<IPaginatablePayload<IUser>> => {
	return {
		type: SET_USERS,
		payload: {
			data: users,
			page,
			total,
			size
		}
	}
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
				const {role} = decoded as ITokenPayload;
				dispatch(log_in(token, iss, role));
			})
	};
};

export const get_users = (page = 0) => {
	return (dispatch: Dispatch) => {
		return api_request<IPaginatablePayload<IUser>>({
			method: "GET",
			url: `accounts`,
			params: {p: page},
			version: 1
		})
			.then(({data, page, size, total}) => {
				dispatch(set_users(data, page, total, size));
			});
	}
}