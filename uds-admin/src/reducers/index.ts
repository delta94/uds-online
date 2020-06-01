import {combineReducers} from "redux";
import {IAuthState, reducer as authReducer, defaultState as authDState} from "./authReducer";
import {ISnackState, reducer as snackReducer, defaultState as snackDState} from "./snackbar";
import {IUsersState, reducer as usersReducer, defaultState as usersDState} from "./usersReducer";

export interface IReducerState {
	auth: IAuthState,
	snack: ISnackState,
	users: IUsersState,
}

export const initialReducerState: IReducerState = {
	auth: authDState,
	snack: snackDState,
	users: usersDState
};

const reducers = combineReducers<IReducerState>({
	auth: authReducer,
	snack: snackReducer,
	users: usersReducer
});

export default reducers;
