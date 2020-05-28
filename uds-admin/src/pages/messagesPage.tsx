import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";

import {getMessageUrl} from "../helpers/getUrl";
import {Link} from "react-router-dom";
import {Typography} from "@material-ui/core";
import {PageWrapper} from "../components/pageWrapper";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

export function MessagesPage() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	return (
		<PageWrapper heading="Cообщения">
			<Link to={getMessageUrl(55)}>Message 55</Link>
		</PageWrapper>
	);
}

export default MessagesPage;
