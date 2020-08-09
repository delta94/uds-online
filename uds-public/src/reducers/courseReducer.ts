import {AnyAction} from "redux";
import {SET_COURSES} from "../actions/types";
import {IAction, IPaginatablePayload, IPagination, Model} from "../helpers/models";
import {ILesson} from "./lessonsReducer";

export interface ICourse extends Model<number> {
	title: string,
	picture: string,
	annotation: string,
	published: boolean,
	price: number,
	assistant_id: string,
	lessons: ILesson[],
	purchased: boolean
}

export interface ICourseState extends IPaginatablePayload<ICourse> {
}

export const defaultState: ICourseState = {
	data: [],
	size: 10,
	total: 0,
	page: 0
};

export const reducer = (state: ICourseState = defaultState, action: AnyAction): ICourseState => {
	switch (action.type) {
		case SET_COURSES: {
			const a = action as IAction<IPaginatablePayload<ICourse>>;
			state = {
				...state,
				size: a.payload.size,
				page: a.payload.page,
				total: a.payload.total,
				data: a.payload.data,
			};
			break;
		}
	}
	
	return state;
}