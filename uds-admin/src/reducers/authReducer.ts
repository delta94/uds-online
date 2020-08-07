import {
	LOG_IN,
	LOG_OUT
} from "../actions/types";
import {decode as jwtDecode} from "jsonwebtoken";
import {AnyAction} from "redux";
import {IAction} from "../helpers/models";
import {IUser} from "./usersReducer";
import Cookies from "js-cookie";


const TOKEN = "_token";

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
export type GetAccountsPlainResponse = IUser[];

export interface AuthResponse {
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

export const reducer = (state: IAuthState = defaultState, action: AnyAction): IAuthState => {
	switch (action.type) {
		case LOG_IN: {
			const a = action as IAction<ILoginPayload>;
			Cookies.set(TOKEN, a.payload.token, {expires: 14, secure});
			if (process.env.NODE_ENV === 'production') {
				Cookies.set(TOKEN, a.payload.token, {expires: 14, secure, domain: process.env.REACT_APP_HOST_COOKIE_DOMAIN});
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
