import React, {FC, Suspense, useEffect} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "../reducers";
import {get_courses} from "../actions";
import {ComponentSpinner} from "../components/spinner";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import {getCourseUrl} from "../helpers/getUrl";

interface ICoursesPage {

}

const CoursesPage: FC<ICoursesPage> = () => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const courseState = useSelector((state: IReducerState) => state.course);
	
	useEffect(() => {
		dispatch(get_courses());
	}, []);
	
	
	return (
		<PageWrapper heading={t('TITLES.COURSES')}>
			<Suspense fallback={<ComponentSpinner/>}>
				{courseState.data && courseState.data.map((i) => {
					return (
						<div key={i.ID}>
							{i.title}
							<br/>
							<Button to={getCourseUrl(i.ID!)} component={Link}>
								Открыть
							</Button>
						</div>
					)
				})}
			</Suspense>
		</PageWrapper>
	);
};

export default CoursesPage;
