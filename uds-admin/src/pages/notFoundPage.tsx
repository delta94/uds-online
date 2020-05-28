import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

const NotFoundPage: FC = () => {
	const classes = useStyles();
	
	return (
		<PageWrapper heading="404">
		<Typography variant='body1'>
			Страница, которую вы хотите открыть, не найдена.
		</Typography>
		</PageWrapper>
	);
}

export default NotFoundPage;
