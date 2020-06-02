import {AnyAction} from "redux";

export interface ILesson {
	title: string,
	annotation: string,
	published: boolean,
	paid: boolean,
}

export interface ILessonsState {
	items: ILesson[],
	active?: ILesson
}

export const defaultState: ILessonsState = {
	items: [],
};

export const reducer = (state: ILessonsState = defaultState, action: AnyAction): ILessonsState => {
	switch (action.type) {
		case '': {
			
			break;
		}
	}
	
	return state;
}