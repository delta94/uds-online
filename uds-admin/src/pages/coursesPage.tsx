import React, {lazy, FC, Suspense, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {Button} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {Link} from "react-router-dom";
import {ROUTES} from "../constants";
import {get_courses} from "../actions";
import {ComponentSpinner} from "../components/spinner";
import {useTranslation} from "react-i18next";

const CourseTable = lazy(() => import("../components/courseTable"));

const CoursesPage: FC = () => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const courseState = useSelector((state: IReducerState) => state.course);
	
	useEffect(() => {
		dispatch(get_courses());
	}, []);
	
	return (
		<PageWrapper heading={t('TITLES.COURSES')}
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
