import React, {FC, useState} from "react";
import {Card, CardActionArea, CardContent} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ILessonTask} from "../reducers/lessonsReducer";
import {TaskDialog} from "./taskDialog";
import moment from "moment";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
		task: {
			marginTop: 10,
			marginBottom: 10,
		},
		content: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between'
		},
		createdAt: {
			color: '#828282',
			marginLeft: 10,
		},
		saveRequired: {
			color: '#148E00',
			marginLeft: 10,
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
		console.log("TaskDialog save:", t);
		onSave(t);
		setTaskDialogOpen(false);
	};
	
	const createdAt = task.CreatedAt ? moment(task.CreatedAt).format("DD.MM.YYYY HH:mm") : "";
	
	return (
		<>
			<Card className={classes.task}>
				<CardActionArea onClick={() => setTaskDialogOpen(true)}>
					<CardContent className={classes.content}>
						{task.description}
						{createdAt ?
							<small className={classes.createdAt}>Дата создания: {createdAt}</small>
							:
							<small className={classes.saveRequired}>Требует сохранения</small>}
					</CardContent>
				</CardActionArea>
			</Card>
			
			<TaskDialog open={taskDialogOpen}
						task={task}
						onClose={() => setTaskDialogOpen(false)}
						onSave={handleSave}
			/>
		</>
	);
};