import btoa from "btoa";
import atob from "atob";
import utf8 from "utf8";

export function str2bool(s: string): boolean {
	s = (s || '').toLowerCase();
	if (!s || s === "") {
		return false;
	}
	if (s === 'true' || s === "1") {
		return true;
	}
	return false;
}


export function delay(ms = 50) {
	return new Promise((resolve => {
		setTimeout(() => resolve(), ms);
	}));
}

export function encodeObjectToBase64(object: Object) {
	return btoa(utf8.encode(JSON.stringify(object)));
}

export function decodeBase64ToObject<T>(base64hash: string): T {
	return JSON.parse(utf8.decode(atob(base64hash)));
}

export function validate_email(email: string): boolean {
	const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	if (!re.test(email)) {
		return false
	}
	const forbiddenChars = ["'", "\"", "#", "/", "\\"];
	for (let i = 0; i < email.length; i++) {
		for (let fb = 0; fb < forbiddenChars.length; fb++) {
			if (forbiddenChars[fb] ===  email[i]) {
				return false
			}
		}
		if (i > 0 && email[i] === email[i-1] && email[i] === ".") {
			return false;
		}
	}
	return true;
}