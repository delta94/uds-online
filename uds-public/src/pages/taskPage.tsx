import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {RouteChildrenProps} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

interface IRouteProps {
	id: string
}

export const TaskPage: FC<RouteChildrenProps<IRouteProps>> = ({match}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	const {params: {id}} = match!;
	console.log(id);
	return (
		<PageWrapper heading={`Task #${id}`}>
		
		
		</PageWrapper>
	);
}

export default TaskPage;
