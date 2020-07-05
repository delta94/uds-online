import {AnyAction, Dispatch} from "redux";
import {decode as jwtDecode} from "jsonwebtoken";
import {
	CLOSE_MESSAGE,
	EXIT_MESSAGE,
	LOG_IN,
	LOG_OUT,
	SET_ASSISTANTS,
	SET_COURSES,
	SET_USERS,
	SHOW_POPUP_MESSAGE
} from "./types";
import {AuthResponse, GetAccountsPlainResponse, IAuthRequest, ILoginPayload, ITokenPayload} from "../reducers/authReducer";
import {api_request} from "../helpers/api";
import {IUser} from "../reducers/usersReducer";
import {IAction, IPaginatablePayload} from "../helpers/models";
import history from "../history";
import {ROLES, ROUTES} from "../constants";
import store from "../store";
import {CreateCourseResponse, GetCoursesResponse, ICourse} from "../reducers/courseReducer";

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

export const set_users = (isAssistants: boolean, users: IUser[], page: number, total: number, size: number): IAction<IPaginatablePayload<IUser>> => {
	return {
		type: isAssistants ? SET_ASSISTANTS: SET_USERS,
		payload: {
			data: users,
			page,
			total,
			size
		}
	}
};

export const set_courses = (courses: ICourse[]): IAction<ICourse[]> => {
	return {
		type: SET_COURSES,
		payload: courses
	}
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

export const create_course = (title: string, annotation: string, price: number, assistant_id: string, callback: (course: CreateCourseResponse) => void) => {
	return (dispatch: Dispatch) => {
		return api_request<CreateCourseResponse>({
			method: "POST",
			url: `admin/courses`,
			data: {title, annotation, price, assistant_id},
			version: 1
		})
			.then((course) => {
				callback(course);
			})
	}
}

export const update_course = (id: number, title: string, annotation: string, price: number, assistant_id: string, published: boolean, callback: () => void) => {
	return (dispatch: Dispatch) => {
		return api_request<any>({
			method: "PUT",
			url: `admin/courses`,
			data: {ID: id, title, annotation, price, assistant_id, published},
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
				callback(course);
			});
	}
}

export const get_courses = () => {
	return (dispatch: Dispatch) => {
		return api_request<GetCoursesResponse>({
			method:  "GET",
			url: `admin/courses`,
			version: 1
		})
			.then((courses) => {
				dispatch(set_courses(courses));
			});
	};
}

export const create_purchase = (course_id: number, account_id: string, sum: number, order: number, callback: () => void) => {
	const data = {
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
			.then((response) => {
				callback();
			});
	};
};