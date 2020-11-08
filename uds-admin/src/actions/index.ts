import {AnyAction, Dispatch} from "redux";
import {decode as jwtDecode} from "jsonwebtoken";
import {api_request} from "../helpers/api";
import {IUser} from "../reducers/usersReducer";
import {IAction, IPaginatablePayload} from "../helpers/models";
import history from "../history";
import {ROLES, ROUTES} from "../constants";
import store from "../store";
import {CreateCourseResponse, GetCoursesResponse, ICourse} from "../reducers/courseReducer";
import {ILesson} from "../reducers/lessonsReducer";
import {IUpload} from "../reducers/uploadReducer";
import axios from "axios";
import {
	CLOSE_MESSAGE,
	EXIT_MESSAGE,
	LOG_IN,
	LOG_OUT,
	SET_ASSISTANTS,
	SET_COURSES,
	SET_LESSONS, SET_PURCHASES,
	SET_UPLOADS,
	SET_USERS,
	SHOW_POPUP_MESSAGE
} from "./types";
import {
	AuthResponse,
	GetAccountsPlainResponse,
	IAuthRequest,
	ILoginPayload,
	ITokenPayload
} from "../reducers/authReducer";
import {IPurchase} from "../reducers/tradeReducer";

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
/*
===================== General =====================
*/

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
		return api_request<AuthResponse>({
			method: "POST",
			url: `authenticate/administration`,
			data,
			version: 1
		})
			.then(({token}) => {
				const decoded = jwtDecode(token) as JsonWebKey;
				const {iss} = decoded as ITokenPayload;
				const {role} = decoded as ITokenPayload;
				dispatch(log_in(token, iss, role));
			})
	};
};


export const change_block = (id: string, blocked: boolean, callback?: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "POST",
			url: `accounts/change-block`,
			data: {
				blocked,
				id
			}
		})
			.then(() => {
				if (callback) {
					callback();
				}
			});
	};
};

export const manual_email_confirm = (id: string, callback?: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "POST",
			url: `accounts/confirm`,
			data: {
				id
			}
		})
			.then(() => {
				if (callback) {
					callback();
				}
			});
	};
};

/*
===================== Users =====================
*/
export const set_users = (isAssistants: boolean, users: IUser[], page: number, total: number, size: number): IAction<IPaginatablePayload<IUser>> => {
	return {
		type: isAssistants ? SET_ASSISTANTS : SET_USERS,
		payload: {
			data: users,
			page,
			total,
			size
		}
	}
};



export const get_users = (role: typeof ROLES.ROLE_USER | typeof ROLES.ROLE_ASSISTANT, page?: number) => {
	if (page === undefined && role === ROLES.ROLE_USER) {
		page = store.getState().users.users.page;
	}
	if (page === undefined && role === ROLES.ROLE_ASSISTANT) {
		page = store.getState().users.assistants.page;
	}
	return (dispatch: Dispatch) => {
		return api_request<IPaginatablePayload<IUser>>({
			method: "GET",
			url: `accounts`,
			params: {p: page, r: role},
			version: 1
		})
			.then(({data, page, size, total}) => {
				dispatch(set_users(role === ROLES.ROLE_ASSISTANT, data, page, total, size));
			});
	}
};


export const create_assistant = (name: string, email: string, callback: (result: boolean) => void) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "POST",
			version: 1,
			url: `register/assistant`,
			data: {name, email}
		})
			.then(() => {
				callback(true);
			})
			.catch(() => {
				callback(false);
			});
	};
};

export const get_assistants_plain = (callback: (assistants: IUser[]) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<GetAccountsPlainResponse>({
			method: "GET",
			url: `accounts/assistants`,
			version: 1
		})
			.then((assistants) => {
				callback(assistants);
			})
	};
};

export const get_users_plain = (callback: (users: IUser[]) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<GetAccountsPlainResponse>({
			method: "GET",
			url: `accounts/users`,
			version: 1
		})
			.then((users) => {
				callback(users);
			})
	};
};

/*
===================== Courses =====================
*/

export const set_courses = (courses: ICourse[]): IAction<ICourse[]> => {
	return {
		type: SET_COURSES,
		payload: courses
	}
};

export const create_course = (course: ICourse, callback: (course: CreateCourseResponse) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<CreateCourseResponse>({
			method: "POST",
			url: `admin/courses`,
			data: course,
			version: 1
		})
			.then((course) => {
				callback(course);
			})
	}
}

export const update_course = (course: ICourse, callback: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "PUT",
			url: `admin/courses`,
			data: course,
			version: 1
		})
			.then(() => {
				callback();
			})
	}
}

export const get_course = (id: string, callback: (course: ICourse) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<ICourse>({
			method: "GET",
			url: `admin/courses/${id}`,
			version: 1
		})
			.then((course) => {
				dispatch(set_lessons(course.lessons));
				callback(course);
			})
			.catch(() => {
				history.replace(ROUTES.COURSES);
			});
	}
}

export const get_courses = () => {
	return (dispatch: Dispatch) => {
		return api_request<GetCoursesResponse>({
			method: "GET",
			url: `admin/courses`,
			version: 1
		})
			.then((courses) => {
				dispatch(set_courses(courses));
			});
	};
}

export const clone_course = (id: number, callback: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "POST",
			url: `admin/courses/${id}/copy`
		})
			.then(() => {
				callback();
			});
	}
}

/*
===================== Lessons =====================
*/

export const set_lessons = (lessons: ILesson[]): IAction<ILesson[]> => {
	return {
		type: SET_LESSONS,
		payload: lessons
	};
};

export const get_lesson = (id: number, callback: (lesson: ILesson) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<ILesson>({
			method: "GET",
			url: `admin/lessons/${id}`
		})
			.then((lesson) => {
				callback(lesson);
			});
	};
};

export const create_lesson = (lesson: ILesson, callback: (lesson: ILesson) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "POST",
			url: `admin/lessons`,
			data: lesson,
			version: 1,
		})
			.then((lesson) => {
				callback(lesson);
			});
	};
};

export const update_lesson = (lesson: ILesson, callback: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "PUT",
			url: `admin/lessons`,
			data: lesson,
			version: 1,
		})
			.then(() => {
				callback();
			});
	};
};

/*
===================== Purchases =====================
*/

export const create_purchase = (course_id: number, account_id: string, sum: number, order: number, callback: () => void) => {
	const data: IPurchase = {
		course_id,
		account_id,
		sum,
		order
	};
	return (dispatch: Dispatch) => {
		return api_request({
			method: "POST",
			url: `purchases`,
			data,
			version: 1
		})
			.then(() => {
				callback();
			});
	};
};

export const get_purchases = (page?: number) => {
	if (page === undefined) {
		page = store.getState().purchases.page;
	}
	return (dispatch: Dispatch) => {
		return api_request<IPaginatablePayload<IPurchase>>({
			method: "GET",
			url: `purchases`,
			params: {p: page},
			version: 1
		})
			.then(({data, total, size, page}) => {
				dispatch(set_pg_data<IPurchase>(SET_PURCHASES, data, page, total, size));
			});
	};
};

export const delete_purchase = (id: string, callback: (result: boolean) => void) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "DELETE",
			url: `purchases/${id}`
		})
			.then(() => {
				callback(true);
			})
			.catch(() => callback(false));
	}
}
/*
===================== Uploads =====================
*/

export const get_uploads = (page?: number) => {
	if (page === undefined) {
		page = store.getState().uploads.page;
	}
	return (dispatch: Dispatch) => {
		return api_request<IPaginatablePayload<IUpload>>({
			method: "GET",
			url: `uploads`,
			params: {p: page},
			version: 1
		})
			.then(({data, total, size, page}) => {
				dispatch(set_pg_data<IUpload>(SET_UPLOADS, data, page, total, size));
			});
	};
};

interface IUploadFileConfig {
	onUploadProgress?: (progressEvent: ProgressEvent) => void
}

export const upload_file = (formData: FormData, config: IUploadFileConfig, callback: (result: boolean, path?: string) => void) => {
	interface UploadResponse {
		alias: string;
		comment: string;
		originalName: string;
		path: string;
	}
	return (dispatch: Dispatch) => {
		return axios.post("/v1/uploads", formData, config)
			.then((response) => {
				callback(true, (response as unknown as UploadResponse).path);
			})
			.catch(() => callback(false));
	};
};

export const delete_upload = (id: number, callback: (result: boolean) => void) => {
	return (dispatch: Dispatch) => {
		return api_request({
			method: "DELETE",
			url: `uploads/${id}`,
			version: 1
		})
			.then(() => {
				callback(true);
			})
			.catch(() => callback(false));
	};
};
