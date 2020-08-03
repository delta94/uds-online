import {combineReducers} from "redux";
import {IAuthState, reducer as authReducer, defaultState as authDState} from "./authReducer";
import {ISnackState, reducer as snackReducer, defaultState as snackDState} from "./snackbar";
import {IUsersState, reducer as usersReducer, defaultState as usersDState} from "./usersReducer";
import {ICourseState, reducer as courseReducer, defaultState as courseDState} from "./courseReducer";
import {ILessonsState, reducer as lessonsReducer, defaultState as lessonsDState} from "./lessonsReducer";
import {IUploadState, reducer as uploadReducer, defaultState as uploadDState} from "./uploadReducer";
import {IPurchaseState, reducer as tradeReducer, defaultState as tradeDState} from "./tradeReducer";

export interface IReducerState {
	auth: IAuthState,
	snack: ISnackState,
	users: IUsersState,
	course: ICourseState,
	lessons: ILessonsState,
	uploads: IUploadState,
	purchases: IPurchaseState
}

export const initialReducerState: IReducerState = {
	auth: authDState,
	snack: snackDState,
	users: usersDState,
	course: courseDState,
	lessons: lessonsDState,
	uploads: uploadDState,
	purchases: tradeDState
};

const reducers = combineReducers<IReducerState>({
	auth: authReducer,
	snack: snackReducer,
	users: usersReducer,
	course: courseReducer,
	lessons: lessonsReducer,
	uploads: uploadReducer,
	purchases: tradeReducer
});

export default reducers;
