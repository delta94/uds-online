import {ROUTES} from "../constants";

export function getMessageUrl(id: number) {
	return ROUTES.MESSAGE.replace(/:id/, String(id));
}

export function getCourseUrl(id: number) {
	return `${ROUTES.COURSES}/${id}`;
}

export function getLessonUrl(course_id: string, lesson_id: string): string {
	return ROUTES.LESSON
		.replace(/:course_id/, course_id)
		.replace(/:lesson_id/, lesson_id);
}