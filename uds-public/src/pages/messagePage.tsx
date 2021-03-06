import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

export const MessagePage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	return (
		<>
			Message detailed
		</>
	);
}

export default MessagePage;
