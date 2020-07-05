import {AnyAction} from "redux";
import {IAction, IPaginatablePayload} from "../helpers/models";
import {SET_PURCHASES} from "../actions/types";


export interface IPurchase {
	ID: string,
	CreatedAt: string,
	UpdatedAt: string,
	sum: number,
	issuer: number
}

export interface IPurchaseState extends IPaginatablePayload<IPurchase> {
}

export const defaultState: IPurchaseState = {
	data: [],
	size: 10,
	total: 0,
	page: 0
}

export const reducer = (state = defaultState, action: AnyAction): IPurchaseState => {
	switch (action.type) {
		case SET_PURCHASES: {
			const a = action as IAction<IPaginatablePayload<IPurchase>>;
			state = {
				...state,
				size: a.payload.size,
				page: a.payload.page,
				total: a.payload.total,
				data: a.payload.data
			}
		}
	}
	
	return state;
}