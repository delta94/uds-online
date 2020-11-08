import {
	LOG_IN,
	LOG_OUT
} from "../actions/types";
import {decode as jwtDecode} from "jsonwebtoken";
import {AnyAction} from "redux";
import {IAction} from "../helpers/models";
import Cookies from "js-cookie";


const TOKEN = "token";
const APP_ID = "app-p";
Cookies.set('app-id', APP_ID, {expires: 365, domain: process.env.REACT_APP_HOST_COOKIE_DOMAIN});

export interface IAuthRequest {
	email: string,
	password: {
		value: string
	}
}

export interface IAuthState {
	token: string,
	userID?: string,
	role?: number
}

export interface ITokenPayload {
	iss: string,
	exp: number,
	iat: number,
	role: number
}
export interface ILoginPayload {
	token: string,
	userID: string,
	role: number
}

export interface IRegisterRequest {
	email: string,
	name: string,
	password: {
		value: string,
		confirmation: string
	}
}

export interface IAuthResponse {
	token: string
}

const decodedToken = jwtDecode(Cookies.get(TOKEN) || "");
const userID = decodedToken ? (decodedToken as ITokenPayload).iss : "";
const role = decodedToken ? (decodedToken as ITokenPayload).role : undefined;
if (!decodedToken || !role || !userID || (decodedToken as ITokenPayload).exp * 1000 < Date.now()) {
	Cookies.remove(TOKEN);
}

export const defaultState: IAuthState = {
	token: Cookies.get(TOKEN) || "",
	userID,
	role
};

const secure = process.env.NODE_ENV === 'production';
const COOKIE_LIFETIME_DAYS = 7;

export const reducer = (state: IAuthState = defaultState, action: AnyAction): IAuthState => {
	switch (action.type) {
		case LOG_IN: {
			const a = action as IAction<ILoginPayload>;
			Cookies.set(TOKEN, a.payload.token, {expires: COOKIE_LIFETIME_DAYS, secure});
			if (process.env.NODE_ENV === 'production') {
				Cookies.set(TOKEN, a.payload.token, {expires: COOKIE_LIFETIME_DAYS, secure, domain: process.env.REACT_APP_HOST_COOKIE_DOMAIN});
			}
			state = {
				...state,
				token: a.payload.token,
				userID: a.payload.userID,
				role: a.payload.role
			};
			break;
		}
		case LOG_OUT: {
			Cookies.remove(TOKEN);
			state = {
				...state,
				token: "",
				userID: ""
			};
			break;
		}
	}
	return state;
};
