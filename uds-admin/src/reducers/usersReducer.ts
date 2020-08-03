import {AnyAction} from "redux";
import {IAction, IPaginatablePayload, IPagination, Model} from "../helpers/models";
import {
	SET_ASSISTANTS,
	SET_USERS,
} from "../actions/types";

export interface IUser extends Model<string> {
	email: string,
	is_blocked: boolean,
	role: number,
	confirmed: boolean
}

interface IUserData extends IPagination {
	items: IUser[]
}

export interface IUsersState {
	users: IUserData,
	assistants: IUserData,
}

export const defaultState: IUsersState = {
	users: {
		items: [],
		page: 0,
		total: 0,
		size: 10,
	},
	assistants: {
		items: [],
		page: 0,
		total: 0,
		size: 10,
	}
};

export const reducer = (state = defaultState, action: AnyAction): IUsersState => {
	switch (action.type) {
		case SET_USERS: {
			const a = action as IAction<IPaginatablePayload<IUser>>;
			state = {
				...state,
				users: {
					items: a.payload.data,
					page: a.payload.page,
					total: a.payload.total,
					size: a.payload.size,
				}
			};
			break;
		}
		case SET_ASSISTANTS: {
			const a = action as IAction<IPaginatablePayload<IUser>>;
			state = {
				...state,
				assistants: {
					items: a.payload.data,
					page: a.payload.page,
					total: a.payload.total,
					size: a.payload.size,
				}
			};
			break;
		}
	}
	return state;
}