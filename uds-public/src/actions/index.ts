import {AnyAction, Dispatch} from "redux";
import {decode as jwtDecode} from "jsonwebtoken";
import {IAuthRequest, IAuthResponse, IRegisterRequest, ITokenPayload} from "../reducers/authReducer";
import {api_request} from "../helpers/api";
import history from "../history";
import {ROUTES} from "../constants";
import {ICourse} from "../reducers/courseReducer";
import {IAction, IPaginatablePayload} from "../helpers/models";
import {IAnswerResponse, ILesson, ITaskAnswerSaveRequest} from "../reducers/lessonsReducer";
import {ILoginPayload} from "../reducers/authReducer";
import {
	CLOSE_MESSAGE,
	EXIT_MESSAGE,
	LOG_IN,
	LOG_OUT,
	SHOW_POPUP_MESSAGE,
	SET_COURSES,
	SET_LESSONS, SET_COURSE_PURCHASE_STATE
} from "./types";
import store from "../store";

export const log_in = (token: string, userID: string, role: number): IAction<ILoginPayload> => {
	return {
		type: LOG_IN,
		payload: {token, userID, role}
	}
};

export const log_out = (): AnyAction => {
	history.push(ROUTES.LOGIN);
	return {
		type: LOG_OUT,
	}
};

export const close_message = (reason: string): AnyAction => {
	return {
		type: CLOSE_MESSAGE,
		payload: reason
	};
};

export const exit_message = (): AnyAction => {
	return {
		type: EXIT_MESSAGE
	};
};
export const popup_snack = (message: string): AnyAction => {
	return {
		type: SHOW_POPUP_MESSAGE,
		payload: message
	}
};


export const set_pg_data = <T>(type: string, data: T[], page: number, total: number, size: number): IAction<IPaginatablePayload<T>> => {
	return {
		type,
		payload: {
			data,
			page,
			size,
			total
		}
	};
};

export const issue_password_reset = (email: string) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "POST",
			url: 'issue-password-reset',
			data: {email},
			version: 1
		})
			.catch(err => console.log(err));
	}
}
export const reset_password = (password: string, confirmation: string, token: string, callback?: (arg0: number) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<null>({
			method: "POST",
			url: 'accounts/reset-password',
			data: {
				password, confirmation, token
			},
			version: 1
		})
			.then((response) => {
				if (callback) callback(0);
			})
			.catch(err => console.log(err));
	}
}

export const register_user = (request: IRegisterRequest, recaptchaToken: string) => {
	interface IRegisterResponse {
		email: string,
		id: string,
	}
	return (dispatch: Dispatch) => {
		return api_request<IRegisterResponse>({
			method: "POST",
			url: `register`,
			data: request,
			headers: {
				'x-recaptcha-token': recaptchaToken
			},
			version: 1
		})
			.then(() => {
			
			})
			.catch(err => console.log(err));
	};
};

/**
 * Sends a POST request to authenticate the user. Used to obtain JSON Web Token.
 *
 * @param email
 * @param password
 */
export const authenticate = (email: string, password: string) => {
	const data: IAuthRequest = {
		email,
		password: {
			value: password
		}
	}
	return (dispatch: Dispatch) => {
		return api_request<IAuthResponse>({
			method: "POST",
			url: `authenticate`,
			data,
			version: 1
		})
			.then(({token}) => {
				const decoded = jwtDecode(token) as JsonWebKey;
				const {iss} = decoded as ITokenPayload;
				const {role} = decoded as ITokenPayload;
				dispatch(log_in(token, iss, role));
			})
			.catch(err => console.log(err));
	};
};

/* ====== Courses ======= */

export const set_course_purchase_state = (state: boolean): IAction<boolean> => {
	return {
		type: SET_COURSE_PURCHASE_STATE,
		payload: state
	}
}

export const get_course = (id: string, callback: (course: ICourse) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<ICourse>({
			method: "GET",
			url: `courses/${id}`,
			version: 1
		})
			.then((course) => {
				dispatch(set_course_purchase_state(course.purchased));
				return course;
			})
			.then((course) => {
				dispatch(set_lessons(course.lessons));
				callback(course);
			})
			.catch(err => console.log(err));
	}
}

export const get_courses = (page?: number) => {
	if (page === undefined) {
		page = store.getState().course.page;
	}
	return (dispatch: Dispatch) => {
		return api_request<IPaginatablePayload<ICourse>>({
			method: "GET",
			url: `courses`,
			params: {p: page},
			version: 1
		})
			.then(({data, page, size, total}) => {
				dispatch(set_pg_data<ICourse>(SET_COURSES, data, page, total, size));
			})
			.catch(err => console.log(err));
	};
};

/* ====== Lessons ======= */

export const set_lessons = (lessons: ILesson[]): IAction<ILesson[]> => {
	return {
		type: SET_LESSONS,
		payload: lessons
	};
};

export const get_lesson = (id: string, callback: (lesson: ILesson | null) => void) => {
	return () => {
		return api_request<ILesson>({
			method: "GET",
			url: `lessons/${id}`,
			version: 1
		})
			.then((lesson) => {
				callback(lesson);
			})
			.catch(() => {
				callback(null);
			});
	};
};

export const get_answers = (course_id: string, lesson_id: string, callback: (answers: IAnswerResponse[]) => void) => {
	return () => {
		return api_request<IAnswerResponse[]>({
			method: "GET",
			url: `courses/${course_id}/lessons/${lesson_id}/answers`,
			version: 1
		})
			.then((answers) => {

				callback(answers);
			})
			.catch(err => console.log(err));
	};
};

export const save_answer = (task: number, course_id: string, lesson_id: string, json: string) => {
	const data: ITaskAnswerSaveRequest = {
		json, task
	};
	return () => {
		return api_request({
			method: "POST",
			url: `courses/${course_id}/lessons/${lesson_id}/answers/save`,
			data,
			version: 1
		})
			.then(() => {
			
			})
			.catch(() => {
			
			})
	};
};

/* ======         ======= */


