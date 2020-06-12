import {AnyAction} from "redux";


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

export interface CreateCourseResponse {
	ID: number,
	title: string,
	published: boolean,
	CreatedAt: string
}

export const reducer = (state: ICourseState = defaultState, action: AnyAction): ICourseState => {
	switch (action.type) {
		case '': {
			
			break;
		}
	}
	
	return state;
}