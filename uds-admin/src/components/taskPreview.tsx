import React, {FC, useState} from "react";
import {Card, CardActionArea, CardContent, IconButton} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ILessonTask} from "../reducers/lessonsReducer";
import {TaskDialog} from "./taskDialog";
import moment from "moment";
import clsx from "clsx";
import {Edit} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
		task: {
			marginTop: 10,
			marginBottom: 10,
		},
		grow: {
			flexGrow: 1
		},
		content: {
			display: 'flex',
			alignItems: 'center'
		},
		createdAt: {
			color: '#828282',
			marginLeft: 10,
			marginRight: 10,
		},
		saveRequired: {
			color: '#148E00',
			marginLeft: 10,
			marginRight: 10,
		},
		unpublished: {
			textDecoration: 'line-through'
		}
	})
);

interface ITaskPreviewProps {
	task: ILessonTask;
	onSave: (task: ILessonTask) => void;
}

export const TaskPreview: FC<ITaskPreviewProps> = ({task, onSave}) => {
	const classes = useStyles();
	const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
	
	const handleSave = (t: ILessonTask) => {
		onSave(t);
		setTaskDialogOpen(false);
	};
	
	const createdAt = task.CreatedAt ? moment(task.CreatedAt).format("DD.MM.YYYY HH:mm") : "";

	return (
		<>
			<Card className={classes.task}>
				<CardContent className={classes.content}>
					<span className={clsx({[classes.unpublished]: !task.published})}>{task.description}</span>
					
					<div className={classes.grow}/>
					
					{createdAt ?
						<small className={classes.createdAt}>Дата создания: {createdAt}</small>
						:
						<small className={classes.saveRequired}>Требует сохранения</small>
					}
					<IconButton onClick={() => setTaskDialogOpen(true)}>
						<Edit />
					</IconButton>
				</CardContent>
			</Card>
			
			<TaskDialog open={taskDialogOpen}
						task={task}
						onClose={() => setTaskDialogOpen(false)}
						onSave={handleSave}
			/>
		</>
	);
};