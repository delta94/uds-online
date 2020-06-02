import React, {ComponentProps, FC} from "react";
import {PageWrapper} from "../components/pageWrapper";
import { RouteComponentProps, RouteProps, withRouter } from "react-router-dom";

interface IRouteProps {
	course_id: string,
	lesson_id: string
}

const LessonPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
	const {params: {course_id, lesson_id}} = match!;
	
	return (
		<PageWrapper heading="Раздел">
			{course_id}<br/>{lesson_id}
		</PageWrapper>
	);
};

export default withRouter(LessonPage);