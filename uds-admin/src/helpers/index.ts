/*
 * Copyright (c) 2020. Maxim Isaev.
 */

export function delay(ms = 50) {
	return new Promise((resolve => {
		setTimeout(() => resolve(), ms);
	}));
}