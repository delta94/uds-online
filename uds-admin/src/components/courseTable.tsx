import React, {FC} from "react";
import {IPagination} from "../helpers/models";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

interface ICourseTableProps extends IPagination {
	courses: [],
	onChangePage: Function
}

export const CourseTable: FC<ICourseTableProps> = (props) => {
	const classes = useStyles();
	const {courses, page, total, onChangePage, size} = props;
	const count = Math.ceil(total / size) || 1;
	return (
		<div>
		
		</div>
	);
}