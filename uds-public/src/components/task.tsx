import React, {FC, useEffect, useState} from "react";
import {ITask, ITaskType} from "../helpers/models";
import {Button, Card, CardActions, CardContent, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import WidgetSingleOption from "./widgetSingleOption";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {save_answer} from "../actions";


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			marginBottom: 10,
			marginTop: 10,
		}
	}),
);

interface ITaskProps extends ITask {
	course_id: string,
	lesson_id: string,
}

const Task: FC<ITaskProps> = ({ID, course_id, lesson_id, description, json, type}) => {
	const [t] = useTranslation();
	const classes = useStyles();
	const [jsonAnswer, setJsonAnswer] = useState<string>("");
	const dispatch = useDispatch();
	
	let widget = null;
	
	switch (type) {
		case ITaskType.PICK_SINGLE_ANSWER:
			widget = <WidgetSingleOption data={json} onJsonUpdate={(str) => setJsonAnswer(str)}/>;
			break
		case ITaskType.PICK_MULTIPLE_ANSWERS:
			break;
		case ITaskType.COMPARE_OPTIONS:
			break;
		case ITaskType.FILL_GAPS:
			break;
	}
	
	const confirmAnswer = () => {
		if (jsonAnswer && ID) {
			dispatch(save_answer(ID, course_id, lesson_id, jsonAnswer));
		}
	};
	
	return (
		<Card className={classes.root}>
			<CardContent>
				<Typography variant="h5">
					{description}
				</Typography>
				
				{widget}
			</CardContent>
			
			<CardActions>
				<Button
					variant="contained"
					color="primary"
					type='button'
					onClick={confirmAnswer}
				>
					{t('BUTTONS.CONFIRM')}
				</Button>
			</CardActions>
		</Card>
	)
};

export default Task;
