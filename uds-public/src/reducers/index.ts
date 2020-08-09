import {combineReducers} from "redux";
import {IAuthState, reducer as authReducer, defaultState as authDState} from "./authReducer";
import {ISnackState, reducer as snackReducer, defaultState as snackDState} from "./snackbar";
import {ICourseState, reducer as courseReducer, defaultState as courseDState} from "./courseReducer";
import {ILessonsState, reducer as lessonsReducer, defaultState as lessonsDState} from "./lessonsReducer";

export interface IReducerState {
	auth: IAuthState,
	snack: ISnackState,
	course: ICourseState,
	lessons: ILessonsState,
}

export const initialReducerState: IReducerState = {
	auth: authDState,
	snack: snackDState,
	course: courseDState,
	lessons: lessonsDState,
};

const reducers = combineReducers<IReducerState>({
	auth: authReducer,
	snack: snackReducer,
	course: courseReducer,
	lessons: lessonsReducer,
});

export default reducers;
