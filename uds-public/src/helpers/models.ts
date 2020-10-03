import {IAnswerResponse, ILessonTask} from "../reducers/lessonsReducer";

export type Modify<T, R> = Omit<T, keyof R> & R;

export type Sortable<T> = T & {sort: number};

export interface IPagination {
	total: number,
	page: number,
	size: number,
}

export interface IUser extends Model<string> {
	email: string,
	name: string,
	is_blocked: boolean,
	role: number,
	confirmed: boolean
}

export interface IPaginatablePayload<T> extends IPagination {
	data: T[]
}

export interface Model<T> {
	ID?: T,
	CreatedAt?: string,
	UpdatedAt?: string,
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

export interface IAnswer <T> {
	control: T
}

export interface ITaskSingleOption {
	text: string,
	options: ITaskOption[],
	control: number
}

export type IAnswerSingleOption = IAnswer<number>;

export interface ITaskMultipleOptions {
	text: string,
	options: ITaskOption[],
	control: number[]
}

export type IAnswerMultipleOptions = IAnswer<number[]>;

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

export interface ITaskWidget<TGivenAnswer> {
	data: string,
	givenAnswer: TGivenAnswer,
	onUpdate: (json_str: string, potentialAnswer: any) => void
}
export type ITask = Modify<ILessonTask, {
	type: TaskJsonType,
	_givenAnswer?: IAnswerResponse,
}>;
