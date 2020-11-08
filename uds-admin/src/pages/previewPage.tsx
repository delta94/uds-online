import React, {FC, useEffect, useState} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {ILessonTask} from "../reducers/lessonsReducer";
import {get_lesson} from "../actions";
import {ParsedContent} from "../components/parsedContent";
import {Button} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
		
		},
		header: {
			padding: '0.5rem 1rem',
			background: '#ffffa4',
			marginBottom: 10,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between'
		},
		close: {
			marginLeft: 10
		},
		wrap: {
			width: 980,
			maxWidth: '100%',
			margin: '0 auto',
			padding: '0 10px'
		}
	}),
);

interface IRouteProps {
	course_id: string,
	lesson_id?: string
}


const PreviewPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
	const classes = useStyles();
	
	const {params: {lesson_id}} = match!;
	const [body, setBody] = useState<string>("");
	const [tasks, setTasks] = useState<ILessonTask[]>([]);
	const dispatch = useDispatch();
	
	useEffect(() => {
		dispatch(get_lesson(Number(lesson_id), ({content}) => {
			const {body, tasks} = content!;
			setBody(body);
			setTasks(tasks);
		}));
	}, []);
	
	return (
		<div className={classes.root}>
			<header className={classes.header}>
				<p>
					Вы находитесь в демонстрационном режиме. Отображение в Production среде может несколько отличаться.
				</p>
				<Button
					className={classes.close}
					variant="contained"
					color="primary"
					size="small"
					onClick={() => window.close()}>
					Закрыть
				</Button>
			</header>
			<div className={classes.wrap}>
				{body && <ParsedContent content={body}/>}
				{tasks.map(() => {
					return null;
				})}
			</div>
		</div>
	);
};

export default withRouter(PreviewPage);
