import {IAction, IPaginatablePayload} from "../helpers/models";
import {AnyAction} from "redux";
import {SET_UPLOADS} from "../actions/types";

export interface IUpload {
	ID: number;
	alias: string;
	original_name: string;
	type: string;
	comment: string;
	path: string;
	CreatedAt: string;
	UpdatedAt: string;
}

export interface IUploadState extends IPaginatablePayload<IUpload> {
}

export const defaultState: IUploadState = {
	data: [],
	size: 10,
	total: 0,
	page: 0
};

export const reducer = (state = defaultState, action: AnyAction): IUploadState => {
	switch (action.type) {
		case SET_UPLOADS: {
			const a = action as IAction<IPaginatablePayload<IUpload>>;
			state = {
				...state,
				size: a.payload.size,
				page: a.payload.page,
				total: a.payload.total,
				data: a.payload.data
			};
			break;
		}
	}
	
	return state;
};