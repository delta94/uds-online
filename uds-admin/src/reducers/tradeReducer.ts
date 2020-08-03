import {AnyAction} from "redux";
import {IAction, IPaginatablePayload, Model} from "../helpers/models";
import {SET_PURCHASES} from "../actions/types";


export interface IPurchase extends Model<string> {
	account_id: string,
	course_id: number,
	order: number,
	sum: number
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
			break;
		}
	}
	
	return state;
}