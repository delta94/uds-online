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
		delete: {
			color: 'red'
		}
	}),
);


export const WidgetSingleOption: FC<ITaskWidget> = ({data, onJsonUpdate}) => {
	const classes = useStyles();
	const [options, setOptions] = useState<ITaskOption[]>([]);
	const [control, setControl] = useState<number>();
	const [text, setText] = useState<string>("");
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskSingleOption>(data);
			setOptions(parsed.options);
			setText(parsed.text);
		}
	}, []);
	
	useEffect(() => {
		if (!validate()) {
			onJsonUpdate("");
			return;
		}
		const t: IAnswerSingleOption = {
			control: control!
		};
		
		onJsonUpdate(encodeObjectToBase64(t));
	}, [control]);
	
	const validate = (): boolean => {
		let valid = true;
		if (!control || !Number.isInteger(control)) {
		    valid = false;
		}
		return valid;
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
									checked={id === control}
									color="primary"
									onChange={() => setControl(id)}
									inputProps={{'aria-label': 'primary checkbox'}}
								/>
							}
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
