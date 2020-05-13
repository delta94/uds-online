import React, {useState} from "react";
import {Link, Redirect, RouteProps} from "react-router-dom";
import {ROUTES} from "../constants";
import {InputLabel, FormControl, Input, InputAdornment, Button, Typography} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import img from '../assets/img/background.jpg';
import qs from "query-string";
import {useDispatch} from "react-redux";
import {reset_password} from "../actions";
import {Check} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		bg: {
			background: `0 0 url(${img}) no-repeat`,
			filter: 'blur(4px)',
			height: '102%',
			width: '102%',
			position: 'fixed',
			left: '-1%',
			top: '-1%',
			backgroundSize: 'cover',
		},
		wrap: {
			position: 'relative',
			width: '100vw',
			height: '100vh',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},
		heading: {
			marginBottom: '2rem',
			textAlign: 'center',
		},
		form: {
			position: 'relative',
			width: '500px',
			maxWidth: '100%',
			borderRadius: '5px',
			padding: '1.5rem 1rem',
			margin: '0 0.5rem',
			backgroundColor: 'rgba(255,255,255,0.95)',
			zIndex: 2
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
		succeed: {
			textAlign: 'center',
			color: '#117400',
			marginBottom: '2rem',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		failed: {
			textAlign: 'center',
			color: '#a00000'
		}
	}),
);

export const ResetPage: React.FC<RouteProps> = ({location}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [password, setPassword] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const [result, setResult] = useState<boolean | null>(null);
	
	// Check Reset token
	const s = qs.parse(location!.search);
	if (!s.t || (s.t && s.t.length !== 64)) {
		return <Redirect to={ROUTES.HOME}/>
	}
	
	function onSubmit(e: React.SyntheticEvent | React.MouseEvent) {
		e.preventDefault();
		const t = s.t as string;
		dispatch(reset_password(password, confirmation, t, (r) => {
			if (!r) {
				setResult(true);
				return;
			} else if (r !== 1007 && r !== 1008) {
				setResult(false);
				return;
			}
			setPassword('');
			setConfirmation('');
		}));
	}
	
	const succeed = <div>
		<Typography variant="body1" className={classes.succeed}>
			<Check fontSize="large"/> You've successfully reset your password!
		</Typography>
		<Button component={Link} to={ROUTES.LOGIN} fullWidth color="primary">Back to login</Button>
	</div>
	const failed = <div><Typography variant="body1" className={classes.failed}>Could not reset password</Typography></div>
	
	return (
		<div className={classes.wrap}>
			<div className={classes.bg} />
			<form autoComplete="off" className={classes.form} onSubmit={onSubmit}>
				<Typography variant="h5" className={classes.heading}>
					Reset Password
				</Typography>
				{result === null ?
					<>
					<FormControl fullWidth className={classes.formControl}>
					<InputLabel htmlFor="password">Password</InputLabel>
					<Input
					id="password"
					value={password}
					inputProps={{maxLength: 20, minLength: 6}}
					required
					onChange={e => setPassword(e.target.value)}
					type="password"
					/>
					</FormControl>
					
					<FormControl fullWidth className={classes.formControl}>
					<InputLabel htmlFor="password-confirm">Confirm Password</InputLabel>
					<Input
					id="password-confirm"
					value={confirmation}
					inputProps={{maxLength: 20, minLength: 6}}
					required
					onChange={e => setConfirmation(e.target.value)}
					type="password"
					
					/>
					</FormControl>
					<div className={classes.buttonBar}>
					<Button type="submit" color="primary" fullWidth variant="contained">Confirm</Button>
					</div>
					</>
					:
					result ? succeed : failed
				}
			</form>
		
		</div>
	);
}

export default ResetPage;
