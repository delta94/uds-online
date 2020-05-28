import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {ParsedContent} from "../components/parsedContent";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

function UsersPage() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	return (
		<PageWrapper heading="Пользователи">
		
		</PageWrapper>
	);
}

export default UsersPage;
