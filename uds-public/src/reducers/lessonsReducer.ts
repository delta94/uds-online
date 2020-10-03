import {AnyAction} from "redux";
import {IAction, IPagination, ITaskType, Model} from "../helpers/models";
import {SET_COURSE_PURCHASE_STATE, SET_LESSONS} from "../actions/types";

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

export interface ITaskAnswerSaveRequest {
	json: string,
	task: number
}

export interface IAnswerResponse extends Model<number>{
	lesson_task_id: number,
	json: string
}

export interface ILessonsState extends IPagination {
	items: ILesson[],
	purchased: boolean
}

export const defaultState: ILessonsState = {
	items: [],
	page: 0,
	total: 0,
	size: 10,
	purchased: false
};

export const reducer = (state: ILessonsState = defaultState, action: AnyAction): ILessonsState => {
	switch (action.type) {
		case SET_LESSONS: {
			const a = action as IAction<ILesson[]>;
			state = {...state, items: a.payload};
			break;
		}
		case SET_COURSE_PURCHASE_STATE: {
			const a = action as IAction<boolean>;
			state = {...state, purchased: a.payload};
			break;
		}
	}
	
	return state;
}
