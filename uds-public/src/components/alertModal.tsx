import React, {FC} from "react";
import {Modal, Typography, Divider, Button} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

interface IAlertModal {
	open: boolean,
	text: string,
	onClose: Function
	heading?: string
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			position: 'absolute',
			width: 600,
			backgroundColor: theme.palette.background.paper,
			border: '1px solid #000',
			outline: 'none',
			padding: theme.spacing(3, 3, 3),
			maxWidth: '80%',
			top: '40%',
			left: '50%',
			transform: `translate(-50%, -40%)`,
		},
		divider: {
			margin: '1rem 0',
		},
		buttonBar: {
			marginTop: '2rem',
		},
		cancel: {
			marginRight: '1rem',
		}
	})
);

const AlertModal: FC<IAlertModal> = ({open, text, heading, onClose}) => {
	const classes = useStyles();
	return (
		<>
			<Modal
				open={open}
				aria-labelledby="simple-modal-title"
				aria-describedby="simple-modal-description"
			>
				<div className={classes.wrap}>
					{heading && <>
						<Typography variant='h5'>{heading}</Typography>
						<Divider className={classes.divider}/>
					</>
					}
					<Typography variant='body1'>{text}</Typography>
					<div className={classes.buttonBar}>
						<Button
							color='primary'
							className={classes.cancel}
							onClick={() => onClose()}>Закрыть</Button>
					</div>
				</div>
			</Modal>
		</>
	)
};

export default AlertModal;