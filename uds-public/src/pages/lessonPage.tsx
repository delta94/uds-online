import React, {FC, useEffect, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {get_lesson} from "../actions";
import {ILessonTask} from "../reducers/lessonsReducer";
import {ParsedContent} from "../components/parsedContent";
import history from "../history";
import {ROUTES} from "../constants";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

interface IRouteProps {
	course_id: string,
	lesson_id: string
}

const LessonPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
	const {params: {lesson_id}} = match!;
	const classes = useStyles();
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const [body, setBody] = useState<string>("");
	const [tasks, setTasks] = useState<ILessonTask[]>([]);
	
	
	
	useEffect(() => {
		// Preload lesson and check if the lesson is available for the user
		dispatch(get_lesson(lesson_id, (lesson) => {
			if (!lesson || !lesson.content || !lesson.content.body) {
				// redirect page
				history.replace(ROUTES.COURSES);
				return
			}
			const {body, tasks} = lesson.content;
			setBody(body);
			setTasks(tasks);
		}));
	}, []);
	
	const reset_tasks = () => {
	
	};
	
	return (
		<PageWrapper heading={t('')}>
			{body && <ParsedContent content={body}/>}
			{tasks.map(() => {
				return null;
			})}
		</PageWrapper>
	);
};

export default withRouter(LessonPage);