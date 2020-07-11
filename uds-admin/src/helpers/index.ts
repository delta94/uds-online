import {
	ITask,
	ITaskCompareOptions,
	ITaskFillGaps,
	ITaskMultipleOptions, ITaskOption,
	ITaskSingleOption,
	ITaskType
} from "./models";
import btoa from "btoa";
import atob from "atob";
import utf8 from "utf8";

export function delay(ms = 50) {
	return new Promise((resolve => {
		setTimeout(() => resolve(), ms);
	}));
}

export function getNewOptionId(options: ITaskOption[]) {
	return Math.max(...options.map(o => o.id)) + 1;
}

export function encodeObjectToBase64(object: Object) {
	return btoa(utf8.encode(JSON.stringify(object)));
}

export function decodeBase64ToObject<T>(base64hash: string): T {
	return JSON.parse(utf8.decode(atob(base64hash)));
}

// export function convertTask(tr: ITaskRaw): ITask {
// 	return {
// 		id: tr.id,
// 		description: tr.description,
// 		type: tr.type,
// 		json: (() => {
// 			switch (tr.type) {
// 				case ITaskType.PICK_SINGLE_ANSWER:
// 					return JSON.parse(tr.json) as ITaskSingleOption;
// 				case ITaskType.PICK_MULTIPLE_ANSWERS:
// 					return JSON.parse(tr.json) as ITaskMultipleOptions;
// 				case ITaskType.COMPARE_OPTIONS:
// 					return JSON.parse(tr.json) as ITaskCompareOptions;
// 				case ITaskType.FILL_GAPS:
// 					return JSON.parse(tr.json) as ITaskFillGaps;
// 			}
// 		})()!
// 	};
// }