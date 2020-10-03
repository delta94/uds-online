import React, {FC, useEffect, useState} from "react";
import {ITaskOption, ITaskSingleOption, IAnswerSingleOption, ITaskWidget} from "../helpers/models";
import {decodeBase64ToObject, encodeObjectToBase64} from "../helpers";
import {Checkbox, Divider, FormControlLabel, Typography} from "@material-ui/core";
import clsx from "clsx";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 15
		},
		optionWrap: {
			display: 'flex',
			marginBottom: 10,
			alignItems: 'center'
		},
		optionInput: {
			marginRight: 10,
		},
		grow: {
			flexGrow: 1
		},
		correctAnswer: {
			color: '#008000',
			'& *': {
				fontWeight: '700 !important' as any,
			},
		},
		wrongAnswer: {
			color: '#c10000',
			'& *': {
				fontWeight: '700 !important' as any,
			},
		},
	}),
);


export const WidgetSingleOption: FC<ITaskWidget<number>> = ({data, givenAnswer, onUpdate}) => {
	const classes = useStyles();
	const [options, setOptions] = useState<ITaskOption[]>([]);
	const [control, setControl] = useState<number>();
	const [text, setText] = useState<string>("");
	const [correctAnswer, setCorrectAnswer] = useState<number>();


	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskSingleOption>(data);
			setOptions(parsed.options);
			setText(parsed.text);
			setCorrectAnswer(parsed.control);
		}
	}, []);
	
	useEffect(() => {
		if (!validate()) {
			onUpdate("", null);
			return;
		}
		const t: IAnswerSingleOption = {
			control: control!
		};

		onUpdate(encodeObjectToBase64(t), control!);
	}, [control]);
	
	const validate = (): boolean => {
		let valid = true;
		if (!control || !Number.isInteger(control)) {
		    valid = false;
		}
		return valid;
	};

	const onCheckboxChange = (id: number) => {
		if (givenAnswer) {
			return;
		}
		setControl(id);
	};

	return (
		<>
			<Typography variant='body1'>
				{text}
			</Typography>
			
			<div className={classes.spacer}/>
			
			<Divider/>
			
			<div className={classes.spacer}/>
			
			{options.map(({id, option}, i) => {
				return (
					<div key={id} className={classes.optionWrap}>
						<FormControlLabel
							value={option}
							control={
								<Checkbox
									checked={id === control || id === givenAnswer}
									color="primary"
									onChange={() => onCheckboxChange(id)}
									inputProps={{'aria-label': 'primary checkbox'}}
								/>
							}
							className={clsx({
								[classes.correctAnswer]: givenAnswer &&  correctAnswer === id,
								[classes.wrongAnswer]: givenAnswer && givenAnswer !== correctAnswer && givenAnswer === id,
							})}
							label={option}
							labelPlacement="end"
						
						/>
					</div>
				);
			})}
		
		</>
	);
};

export default WidgetSingleOption
