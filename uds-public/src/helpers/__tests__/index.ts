import {str2bool} from "../index";

describe("Function 'str2bool'", () => {
	test("Should return TRUE", () => {
		const values = [
			"true",
			"TRUE",
			"tRue",
			"1"
		];
		values.forEach((v) => {
			expect(str2bool(v)).toBe(true);
		});
	});
	
	test("Should return FALSE", () => {
		const values = [
			"0",
			"false",
			"FALSE",
			"fAlSe",
			"",
			undefined,
			null,
			NaN
		];
		values.forEach((v) => {
			expect(str2bool(v as string)).toBe(false);
		});
	});
});