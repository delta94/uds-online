import {AnyAction} from "redux";
import {IPagination} from "../helpers/models";

export interface ILessonTask {
	ID?: number,
	type: number,
	data: string
}

export interface ILessonContent {
	content: string,
	tasks: ILessonTask[]
}

export interface ILesson {
	ID: number,
	title: string,
	annotation: string,
	published: boolean,
	paid: boolean,
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
		case '': {
			
			break;
		}
	}
	
	return state;
}