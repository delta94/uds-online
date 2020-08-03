import {AnyAction} from "redux";
import {IAction, IPagination, ITaskType, Model} from "../helpers/models";
import {SET_LESSONS} from "../actions/types";

export interface ILessonTask extends Model<number> {
	type: ITaskType;
	description: string;
	json: string;
	published: boolean;
	sort: number;
}

export interface ILessonContent extends Model<number> {
	body: string,
	tasks: ILessonTask[]
}

export interface ILesson extends Model<number> {
	title: string,
	annotation: string,
	published: boolean,
	paid: boolean,
	course_id: number,
	content?: ILessonContent
}

export interface ILessonsState extends IPagination {
	items: ILesson[],
}

export const defaultState: ILessonsState = {
	items: [],
	page: 0,
	total: 0,
	size: 10,
};

export const reducer = (state: ILessonsState = defaultState, action: AnyAction): ILessonsState => {
	switch (action.type) {
		case SET_LESSONS: {
			const a = action as IAction<ILesson[]>;
			state = {...state, items: a.payload};
			break;
		}
	}
	
	return state;
}