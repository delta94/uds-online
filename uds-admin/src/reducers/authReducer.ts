import {
	LOG_IN,
	LOG_OUT
} from "../actions/types";
import {decode as jwtDecode} from "jsonwebtoken";
import {Action, AnyAction} from "redux";
import {IAction} from "../helpers/models";
import {IUser} from "./usersReducer";

const TOKEN = "_token";
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
const decodedToken = jwtDecode(storage.getItem(TOKEN) || "");
const userID = decodedToken ? (decodedToken as ITokenPayload).iss : "";
const role = decodedToken ? (decodedToken as ITokenPayload).role : undefined;
if (!decodedToken || !role || !userID || (decodedToken as ITokenPayload).exp * 1000 < Date.now()) {
	storage.removeItem(TOKEN);
}

export const defaultState: IAuthState = {
	token: storage.getItem(TOKEN) || "",
	userID,
	role
};

export const reducer = (state: IAuthState = defaultState, action: AnyAction): IAuthState => {
	switch (action.type) {
		case LOG_IN: {
			const a = action as IAction<ILoginPayload>;
			storage.setItem(TOKEN, a.payload.token);
			state = {
				...state,
				token: a.payload.token,
				userID: a.payload.userID,
				role: a.payload.role
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
