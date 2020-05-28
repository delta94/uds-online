import {
	SHOW_POPUP_MESSAGE,
	CLOSE_MESSAGE,
	EXIT_MESSAGE,
} from '../actions/types';
import {AnyAction} from "redux";

interface IQueueItem {
	message: string,
	key: number
}

export interface ISnackState {
	open: boolean,
	queue: IQueueItem[],
	messageInfo: IQueueItem
}

export const defaultState: ISnackState = {
	open: false,
	queue: [],
	messageInfo: {
		message: '',
		key: 0
	},
};


export const reducer = (state = defaultState, action: AnyAction) => {
	switch (action.type) {
		
		case SHOW_POPUP_MESSAGE: {
			state = {
				...state,
				queue: [...state.queue, {message: action.payload, key: new Date().getTime()}]
			};
			if (state.open) {
				state = {
					...state,
					open: false
				};
			} else if (state.queue.length > 0) {
				state = {
					...state,
					open: true,
					messageInfo: state.queue.slice(0, 1)[0],
					queue: state.queue.slice(1)
				};
			}
			break;
		}
		
		case CLOSE_MESSAGE: {
			if (action.payload !== 'clickaway') {
				state = {
					...state,
					open: false
				};
			}
			break;
		}
		
		case EXIT_MESSAGE: {
			if (state.queue.length > 0) {
				state = {
					...state,
					open: true,
					messageInfo: state.queue.slice(0, 1)[0],
					queue: state.queue.slice(1)
				};
			}
			break;
		}
		
		default: {
			
			break;
		}
	}
	
	return state;
};
