import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Redirect} from "react-router-dom";
import {ROUTES} from "../constants";
import {InputLabel, FormControl, Input, InputAdornment, Button, Typography} from "@material-ui/core";
import {Email, Lock} from "@material-ui/icons";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {authenticate} from "../actions";
import {IReducerState} from "../reducers";
import img from '../assets/img/background.jpg';
import {theme} from "../theme";

const BREAKPOINT = theme.breakpoints.values.md - 100;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			position: 'relative',
			width: '100vw',
			height: '100vh',
			display: 'flex',
			justifyContent: 'flex-end',
			alignItems: 'stretch',
			[theme.breakpoints.down(BREAKPOINT)]: {
				justifyContent: 'center',
				alignItems: 'center',
			}
		},
		subheading: {
			marginBottom: '2rem',
			textAlign: 'center',
			color: 'rgba(0, 0, 0, 0.54)'
		},
		heading: {
			marginBottom: '0.5rem',
			textAlign: 'center',
		},
		form: {
			position: 'relative',
			display: 'flex',
			justifyContent: 'space-between',
			flexDirection: 'column',
			width: '300px',
			maxWidth: '100%',
			padding: '20% 1rem 1.5rem 1rem',
			margin: 0,
			backgroundColor: 'rgb(255,255,255)',
			zIndex: 2,
			[theme.breakpoints.down(BREAKPOINT)]: {
				margin: '0 0.5rem',
				padding: '1.5rem 1rem',
			}
		},
		grow: {
			flexGrow: 1,
		},
		formControl: {
			marginBottom: '1rem'
		},
		buttonBar: {
			display: 'flex'
		},
		textBlock: {
			position: 'absolute',
			bottom: 0,
			left: 0,
			padding: '1rem',
			margin: '1rem',
			zIndex: 2,
			background: 'rgba(255,255,255,0.17)',
			color: '#3c3c3c',
			[theme.breakpoints.down(BREAKPOINT)]: {
				display: 'none'
			}
		},
		bg: {
			background: `0 0 url(${img}) no-repeat`,
			filter: 'blur(4px)',
			height: '102%',
			width: '102%',
			position: 'relative',
			left: '-1%',
			top: '-1%',
			backgroundSize: 'cover',
		},
		space: {
			position: 'relative',
			flexGrow: 1,
			overflow: 'hidden',
			[theme.breakpoints.down(BREAKPOINT)]: {
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			}
		},
		bottom: {
			fontSize: '80%',
			color: 'rgba(0, 0, 0, 0.54)',
		}
	}),
);

export function LoginPage() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	const [loggedIn, setLogged] = useState(!!authState.token);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	
	useEffect(() => {
		if (!!authState.token) {
			setLogged(true);
		}
	}, [authState.token]);
	if (loggedIn) {
		return <Redirect to={ROUTES.HOME}/>
	}
	
	function onSubmit(e: React.SyntheticEvent | React.FormEvent) {
		e.preventDefault();
		dispatch(authenticate(email, password));
	}
	
	return (
		<div className={classes.wrap}>
			<div className={classes.space}>
				<div className={classes.bg} />
				<article className={classes.textBlock}>
					<Typography variant="h4">Добро пожаловать в контрольную панель UnDosTres|Online</Typography>
					<br/>
					<Typography variant="body1">
						Пожалуйста, введите Ваши Email и пароль для  входа в систему.
					</Typography>
				</article>
			</div>
			
			<form autoComplete="off" className={classes.form} onSubmit={onSubmit}>
				<div>
					<Typography variant="h5" className={classes.heading}>
						UNDOSTRES|ONLINE
					</Typography>
					<Typography variant="subtitle2" className={classes.subheading}>
						Аутентификация
					</Typography>
					<FormControl fullWidth className={classes.formControl}>
						<InputLabel htmlFor="email">Email</InputLabel>
						<Input
							id="email"
							value={email}
							inputProps={{maxLength: 80}}
							required
							onChange={e => setEmail(e.target.value)}
							type="email"
							startAdornment={<InputAdornment position="start"><Email/></InputAdornment>}
						/>
					</FormControl>
					<FormControl fullWidth className={classes.formControl}>
						<InputLabel htmlFor="password">Пароль</InputLabel>
						<Input
							id="password"
							value={password}
							inputProps={{maxLength: 20, minLength: 6}}
							required
							onChange={e => setPassword(e.target.value)}
							type="password"
							startAdornment={<InputAdornment position="start"><Lock/></InputAdornment>}
						/>
					</FormControl>
					<div className={classes.buttonBar}>
						<Button component='a' color="primary" target="_blank" href={ROUTES.FORGOT}>Забыли пароль?</Button>
						<div className={classes.grow}/>
						<Button type="submit" color="primary" variant="contained">Войти</Button>
					</div>
				</div>
				<div className={classes.bottom}>
					Developed - maximdev.com
				</div>
			</form>
		
		</div>
	);
}

export default LoginPage;
