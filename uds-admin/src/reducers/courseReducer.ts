import {AnyAction} from "redux";


export interface ICourse {
	title: string,
	annotation: string,
	published: boolean,
	price: number,
	assistant_id: string
}

export interface ICourseState {
	items: ICourse[],
}

export const defaultState: ICourseState = {
	items: []
};

export const reducer = (state: ICourseState = defaultState, action: AnyAction): ICourseState => {
	switch (action.type) {
		case '': {
			
			break;
		}
	}
	
	return state;
}