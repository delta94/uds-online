import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

export function ComposeMessagePage() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	return (
		<PageWrapper heading="Compose a message">
		
		</PageWrapper>
	);
}

export default ComposeMessagePage;
