import React, {FC, useEffect, useState} from "react";
import {
	IAnswer,
	IAnswerCompareOptions,
	IAnswerMultipleOptions,
	IAnswerSingleOption,
	ITask,
	ITaskType
} from "../helpers/models";
import {Button, Card, CardActions, CardContent, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import WidgetSingleOption from "./widgetSingleOption";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {save_answer} from "../actions";
import {decodeBase64ToObject} from "../helpers";
import {IAnswerResponse} from "../reducers/lessonsReducer";
import WidgetMultipleOptions from "./widgetMultipleOptions";
import WidgetCompareOptions from "./widgetCompareOptions";


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

const Task: FC<ITaskProps> = ({ID, _givenAnswer, course_id, lesson_id, description, json, type}) => {
	const [t] = useTranslation();
	const classes = useStyles();
	const [jsonAnswer, setJsonAnswer] = useState<string>("");
	const dispatch = useDispatch();
	const [givenAnswer, setGivenAnswer] = useState<any>();
	const [potentialAnswer, setPotentialAnswer] = useState<any>();

	let widget = null;

	switch (type) {
		case ITaskType.PICK_SINGLE_ANSWER:
			if (_givenAnswer && !givenAnswer) {
				setGivenAnswer(decodeBase64ToObject<IAnswerSingleOption>(_givenAnswer.json).control);
			}

			widget = <WidgetSingleOption
				data={json}
				givenAnswer={givenAnswer}
				onUpdate={
					(json_str, pa) => {
						setJsonAnswer(json_str);
						setPotentialAnswer(pa);
					}
				}
			/>;
			break;

		case ITaskType.PICK_MULTIPLE_ANSWERS:
			if (_givenAnswer && !givenAnswer) {
				setGivenAnswer(decodeBase64ToObject<IAnswerMultipleOptions>(_givenAnswer.json).control);
			}

			widget = <WidgetMultipleOptions
				data={json}
				givenAnswer={givenAnswer}
				onUpdate={
					(json_str, pa) => {
						setJsonAnswer(json_str);
						setPotentialAnswer(pa);
					}
				}/>
			break;

		case ITaskType.COMPARE_OPTIONS:
			if (_givenAnswer && !givenAnswer) {
				setGivenAnswer(decodeBase64ToObject<IAnswerCompareOptions>(_givenAnswer.json).control);
			}
			
			widget = <WidgetCompareOptions
				data={json}
				givenAnswer={givenAnswer}
				onUpdate={
					(json_str, pa) => {
						setJsonAnswer(json_str);
						setPotentialAnswer(pa);
					}
				}/>
			break;

		case ITaskType.FILL_GAPS:
			break;
	}

	
	const confirmAnswer = () => {
		if (jsonAnswer && ID && !givenAnswer) {
			setGivenAnswer(potentialAnswer);
			dispatch(save_answer(ID, course_id, lesson_id, jsonAnswer));
		}
	};
	
	return (
		<Card className={classes.root}>
			<CardContent>
				<Typography variant="h6">
					{description}
				</Typography>
				
				{widget}
			</CardContent>
			
			<CardActions>
				<Button
					variant="contained"
					color="primary"
					type='button'
					disabled={!!givenAnswer || !potentialAnswer}
					onClick={confirmAnswer}
				>
					{t('BUTTONS.CONFIRM')}
				</Button>
			</CardActions>
		</Card>
	)
};

export default Task;
