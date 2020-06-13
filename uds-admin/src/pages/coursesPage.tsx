import React, {lazy, FC, Suspense, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {Button} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {Link} from "react-router-dom";
import {ROUTES} from "../constants";
import {get_courses} from "../actions";
import {ComponentSpinner} from "../components/spinner";

const CourseTable = lazy(() => import("../components/courseTable"));

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		buttonBar: {
			display: 'flex',
			justifyContent: 'flex-end',
			marginBottom: 10
		}
	}),
);

const CoursesPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const courseState = useSelector((state: IReducerState) => state.course);
	
	useEffect(() => {
		dispatch(get_courses());
	}, []);
	
	return (
		<PageWrapper heading="Курсы"
					 actionArea={<Button
						 color="primary"
						 variant="contained"
						 component={Link}
						 to={ROUTES.COURSE_ADD}
						 startIcon={<Add />}>Добавить Курс</Button>
		}>
			<Suspense fallback={<ComponentSpinner/>}>
				<CourseTable courses={courseState.items} />
			</Suspense>
		</PageWrapper>
	);
}

export default CoursesPage;
