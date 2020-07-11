import {ILessonTask} from "../reducers/lessonsReducer";

export type Modify<T, R> = Omit<T, keyof R> & R;

export type Sortable<T> = T & {sort: number};

export interface IPagination {
	total: number,
	page: number,
	size: number,
}

export interface IPaginatablePayload<T> extends IPagination {
	data: T[]
}

export interface IAction<T> {
	type: string,
	payload: T
}

export enum ITaskType {
	PICK_SINGLE_ANSWER,
	PICK_MULTIPLE_ANSWERS,
	COMPARE_OPTIONS,
	FILL_GAPS
}

export interface ITaskOption {
	id: number;
	option: string;
}

export interface ITaskSingleOption {
	text: string,
	options: ITaskOption[],
	control: number
}

export interface ITaskMultipleOptions {
	text: string,
	options: ITaskOption[],
	control: number[]
}

export interface ITaskFillGaps {

}

export interface ITaskCompareOptions {
	text?: string,
	options: {
		col_a: ITaskOption[],
		col_b: ITaskOption[],
	},
}

export type TaskJsonType = ITaskSingleOption | ITaskMultipleOptions | ITaskFillGaps;

export interface ITaskWidget {
	data?: string;
	onJsonUpdate: (json_str: string) => void
}
export type ITask = Modify<ILessonTask, {
	json: TaskJsonType;
}>;