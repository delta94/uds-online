import React, {FC, useEffect, useState, Suspense} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {get_answers, get_lesson} from "../actions";
import {ILessonTask} from "../reducers/lessonsReducer";
import {ParsedContent} from "../components/parsedContent";
import history from "../history";
import {ROUTES} from "../constants";
import {ComponentSpinner} from "../components/spinner";
import Task from "../components/task";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

interface IRouteProps {
	course_id: string,
	lesson_id: string
}

const LessonPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
	const {params: {lesson_id, course_id}} = match!;
	const classes = useStyles();
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const [body, setBody] = useState<string>("");
	const [tasks, setTasks] = useState<ILessonTask[]>([]);
	
	useEffect(() => {
		// Preload lesson and check if the lesson is available for the user
		dispatch(get_lesson(lesson_id, (lesson) => {
			if (!lesson || !lesson.content || !('body' in lesson.content)) {
				// redirect page
				history.replace(ROUTES.COURSES);
				return
			}
			const {body, tasks} = lesson.content;
			setBody(body);
			setTasks(tasks);
			
			dispatch(get_answers(course_id, lesson_id));
		}));
	}, []);
	
	const reset_tasks = () => {
	
	};
	
	return (
		<PageWrapper heading={t('')}>
			{body && <ParsedContent content={body}/>}
			
			<hr/>
			
			<Suspense fallback={ComponentSpinner}>
				{tasks.map((task) => {
					return (
						<Task
							key={task.ID}
							course_id={course_id}
							lesson_id={lesson_id}
							{...task}
						/>
					)
				})}
			</Suspense>
		</PageWrapper>
	);
};

export default withRouter(LessonPage);
