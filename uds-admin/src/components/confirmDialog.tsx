import React, {FC, useState} from "react";
import Draggable from 'react-draggable';
import {
	Button,
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

function PaperComponent(props: PaperProps) {
	return (
		<Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
}