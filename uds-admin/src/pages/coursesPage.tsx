import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {CourseTable} from "../components/courseTable";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

const CoursesPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
	
	};
	
	return (
		<PageWrapper heading="Курсы">
			<CourseTable courses={[]} onChangePage={handlePageChange} total={1} page={1} size={1} />
		</PageWrapper>
	);
}

export default CoursesPage;
