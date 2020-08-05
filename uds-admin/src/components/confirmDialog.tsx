import React, {FC} from "react";
import Draggable from 'react-draggable';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Paper,
	PaperProps
} from "@material-ui/core";


interface IConfirmDialogProps {
	text: string,
	open: boolean,
	heading: string
}

export const ConfirmDialog: FC<IConfirmDialogProps> = ({children, text, heading, open}) => {
	return (
		<Dialog
			open={open}
			fullWidth
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
				{heading}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>{text}</DialogContentText>
			</DialogContent>
			<DialogActions>{children}</DialogActions>
		</Dialog>
	);
};

export function PaperComponent(props: PaperProps) {
	const styles = {
		width: 'auto',
		minWidth: 600,
		maxWidth: 'calc(100% - 64px)',
		
	};
	return (
		<Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} style={styles}/>
		</Draggable>
	);
}