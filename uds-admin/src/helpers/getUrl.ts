import {ROUTES} from "../constants";

export function getMessageUrl(id: number): string {
	return ROUTES.MESSAGE.replace(/:id/, String(id));
}

export function getAddLessonUrl(course_id: string): string{
	return ROUTES.LESSON_ADD.replace(/:course_id/, course_id);
}

export function getCourseUrl(id: string): string {
	return `${ROUTES.COURSES}/${id}`;
}