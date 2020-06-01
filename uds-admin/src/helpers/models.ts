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