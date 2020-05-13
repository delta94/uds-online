import {combineReducers} from "redux";
import {IAuthState, reducer as authReducer, defaultState as authDState} from "./authReducer";
import {ISnackState, reducer as snackReducer, defaultState as snackDState} from "./snackbar";

export interface IReducerState {
	auth: IAuthState,
	snack: ISnackState
}

export const initialReducerState: IReducerState = {
	auth: authDState,
	snack: snackDState
};

const reducers = combineReducers<IReducerState>({
	auth: authReducer,
	snack: snackReducer
});

export default reducers;
