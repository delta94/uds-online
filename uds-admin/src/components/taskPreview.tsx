import React, {FC} from "react";
import {Card, CardActionArea, CardContent} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ILessonTask} from "../reducers/lessonsReducer";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
		
		task: {
			marginBottom: 10,
		}
	})
);


interface ITaskPreviewProps {
	task: ILessonTask
}

export const TaskPreview: FC<ITaskPreviewProps> = (props) => {
	const classes = useStyles();
	
	return (
		<Card className={classes.task}>
			<CardActionArea>
				<CardContent>
					fdgdf
				</CardContent>
			</CardActionArea>
		</Card>
	);
};