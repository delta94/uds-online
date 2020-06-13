import {AnyAction} from "redux";
import {SET_COURSES} from "../actions/types";
import {IAction, IPaginatablePayload} from "../helpers/models";


export interface ICourse {
	ID: number,
	title: string,
	annotation: string,
	published: boolean,
	price: number,
	assistant_id: string,
	CreatedAt: string,
	UpdatedAt: string
}

export interface ICourseState {
	items: ICourse[],
}

export const defaultState: ICourseState = {
	items: []
};

export type GetCoursesResponse = ICourse[];

export interface CreateCourseResponse {
	ID: number,
	title: string,
	published: boolean,
	CreatedAt: string
}

export const reducer = (state: ICourseState = defaultState, action: AnyAction): ICourseState => {
	switch (action.type) {
		case SET_COURSES: {
			const a = action as IAction<ICourse[]>;
			state = {
				...state,
				items: a.payload
			};
			break;
		}
	}
	
	return state;
}