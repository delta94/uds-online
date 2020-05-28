import {ROUTES} from "../constants";

export function getMessageUrl(id: number) {
	return ROUTES.MESSAGE.replace(/:id/, String(id));
}

export function getCourseUrl(id: number) {
	return `${ROUTES.COURSES}/${id}`;
}