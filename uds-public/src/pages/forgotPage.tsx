import React, {useState} from "react";
import {Link} from "react-router-dom";
import {ROUTES} from "../constants";
import {InputLabel, FormControl, Input, InputAdornment, Button, Typography} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import img from '../assets/img/background.jpg';
import {Email} from "@material-ui/icons";
import {issue_password_reset} from "../actions";
import {useDispatch} from "react-redux";

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
			display: 'flex',
			flexDirection: 'column',
			height: '100px',
			justifyContent: 'space-between',
			alignItems: 'center'
		}
	}),
);



export const ForgotPage: React.FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [email, setEmail] = useState('');

	function onSubmit(e: React.SyntheticEvent | React.MouseEvent) {
		e.preventDefault();
		dispatch(issue_password_reset(email));
	}
	
	return (
		<div className={classes.wrap}>
			<div className={classes.bg} />
			<form autoComplete="off" className={classes.form} onSubmit={onSubmit}>
				<Typography variant="h5" className={classes.heading}>
					Forgot Password?
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
				<div className={classes.buttonBar}>
					<Button type="submit" color="primary" fullWidth variant="contained">Confirm</Button>
					<Button component={Link} to={ROUTES.LOGIN} color="primary">Back to login</Button>
				</div>

			</form>
		
		</div>
	);
}

export default ForgotPage;
