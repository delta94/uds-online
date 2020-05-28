import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

const CoursesPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	return (
		<PageWrapper heading="Курсы">
		
		</PageWrapper>
	);
}

export default CoursesPage;
