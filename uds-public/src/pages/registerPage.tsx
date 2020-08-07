import React, {FC, useState} from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {str2bool, validate_email} from "../helpers";
import {useDispatch} from "react-redux";
import {register_user} from "../actions";
import {IRegisterRequest} from "../reducers/authReducer";

const MAX_LENGTH_EMAIL = 80;
const MAX_LENGTH_NAME = 20;

const RegisterPage: FC = () => {
	const [recaptchaToken, setRecaptchaToken] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmation, setConfirmation] = useState<string>("");
	const dispatch = useDispatch();
	
	const onRecaptchaChange = (token: string | null) => {
		setRecaptchaToken(token ? token : "");
	}
	
	const isFormValid = (): boolean => {
		let isValid = true;
		if (!email || email.length > MAX_LENGTH_EMAIL || !validate_email(email)) {
			isValid = false;
		}
		if (!name || name.length > MAX_LENGTH_NAME) {
			isValid = false;
		}
		return isValid;
	};
	
	const onSubmit = () => {
		const r: IRegisterRequest = {
			email,
			name,
			password: {
				value: password,
				confirmation
			}
		};
		dispatch(register_user(r, recaptchaToken));
	};
	
	
	const recaptcha = str2bool(process.env.REACT_APP_USE_RECAPTCHA!) ? <ReCAPTCHA
		sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_SITEKEY || ""}
		onChange={onRecaptchaChange}
	/> : null;
	
	return (
		<div>
			{recaptcha}
		</div>
	);
};

export default RegisterPage;