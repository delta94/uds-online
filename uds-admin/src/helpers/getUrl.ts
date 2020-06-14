import {ROUTES} from "../constants";

export function getMessageUrl(id: number): string {
	return ROUTES.MESSAGE.replace(/:id/, String(id));
}

export function getAddLessonUrl(course_id: string): string{
	return ROUTES.LESSON_ADD.replace(/:course_id/, course_id);
}

export function getEditLessonUrl(course_id: string, lesson_id: string): string{
	return ROUTES.LESSON_EDIT
		.replace(/:course_id/, course_id)
		.replace(/:lesson_id/, lesson_id);
}

export function getCourseUrl(id: string): string {
	return `${ROUTES.COURSES}/${id}`;
}

export function getEditCourseUrl(id: string): string {
	return ROUTES.COURSE_EDIT.replace(/:id/, id);
}