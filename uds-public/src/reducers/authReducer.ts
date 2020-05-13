import {
	LOG_IN,
	LOG_OUT
} from "../actions/types";
import {decode as jwtDecode} from "jsonwebtoken";
import {AnyAction} from "redux";

const TOKEN = "token";
const storage = window.localStorage;

export interface IAuthRequest {
	email: string,
	password: {
		value: string,
		confirmation?: string
	}
}

export interface IAuthState {
	token: string,
	userID?: string
}

export interface ITokenPayload {
	iss: string,
	exp: number,
	iat: number,
}

const decodedToken = jwtDecode(storage.getItem(TOKEN) || "");
const userID = decodedToken ? (decodedToken as ITokenPayload).iss : "";
if (!decodedToken || !userID || (decodedToken as ITokenPayload).exp * 1000 < Date.now()) {
	storage.removeItem(TOKEN);
}

export const defaultState: IAuthState = {
	token: storage.getItem(TOKEN) || "",
	userID
};

export const reducer = (state: IAuthState = defaultState, action: AnyAction) => {
	switch (action.type) {
		case LOG_IN: {
			storage.setItem(TOKEN, action.payload.token);
			state = {
				...state,
				token: action.payload.token,
				userID: action.payload.userID
			};
			break;
		}
		case LOG_OUT: {
			storage.removeItem(TOKEN);
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
