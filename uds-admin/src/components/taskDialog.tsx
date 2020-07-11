import React, {FC, useEffect, useState} from "react";
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl, FormControlLabel,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from "@material-ui/core";
import {PaperComponent} from "./confirmDialog";
import clsx from 'clsx';
import {
	ITaskCompareOptions,
	ITaskFillGaps,
	ITaskMultipleOptions,
	ITaskOption,
	ITaskSingleOption,
	ITaskType,
	ITaskWidget
} from "../helpers/models";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {decodeBase64ToObject, delay, encodeObjectToBase64, getNewOptionId} from "../helpers";
import {Delete, Save} from "@material-ui/icons";
import {ILessonTask} from "../reducers/lessonsReducer";


const MAX_LENGTH_DESCRIPTION = 300;
const MAX_LENGTH_TEXT = 500;
const MAX_LENGTH_OPTION = 80;
const MAX_OPTIONS = 8;


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

interface ITaskDialogProps {
	open: boolean;
	task?: ILessonTask;
	onClose: () => void;
	onSave: (task: ILessonTask) => void;
}

export const TaskDialog: FC<ITaskDialogProps> = ({open, onClose, onSave, task}) => {
	const classes = useStyles();
	const [ID, setID] = useState<number>();
	const [description, setDescription] = useState<string>("");
	const [type, setType] = useState<ITaskType>(ITaskType.PICK_SINGLE_ANSWER);
	const [json, setJson] = useState<string>("");
	const [sort, setSort] = useState<number>(0);
	const [published, setPublished] = useState<boolean>(true);
	
	useEffect(() => {
		if (task) {
			setID(task.ID);
			setType(task.type)
			setDescription(task.description);
			setJson(task.json);
			setSort(task.sort);
			setPublished(task.published);
		}
	}, []);
	
	//useEffect(() => {console.log("JSON", json);}, [json]);
	
	const onTypeChange = (value: number) => {
		setType(value);
	};
	
	const handleSave = () => {
		if (!validate()) {
			return;
		}
		const t: ILessonTask = {
			description,
			type,
			json,
			sort,
			published
		};
		if (Number.isInteger(ID)) {
			t.ID = ID;
		}
		onSave(t);
		if (!task) {
			reset();
		}
	};
	
	const reset = () => {
		setID(undefined);
		setJson("");
		setDescription("");
		setType(ITaskType.PICK_SINGLE_ANSWER);
		setSort(0);
	};
	
	const validate = (): boolean => {
		let valid = true;
		if (!json) {
			valid = false;
		}
		if (description.length > MAX_LENGTH_DESCRIPTION || !description.trim().length) {
			valid = false;
		}
		return valid;
	};
	
	let widget;
	
	switch (type) {
		case ITaskType.PICK_SINGLE_ANSWER:
			widget = <WidgetSingleOption data={json} onJsonUpdate={(str) => setJson(str)}/>;
			break;
		case ITaskType.PICK_MULTIPLE_ANSWERS:
			widget = <WidgetMultipleOptions data={json} onJsonUpdate={(str) => setJson(str)}/>;
			break;
		case ITaskType.FILL_GAPS:
			widget = <WidgetFillGaps data={json} onJsonUpdate={(str) => setJson(str)}/>;
			break;
		case ITaskType.COMPARE_OPTIONS:
			widget = <WidgetCompareOptions data={json} onJsonUpdate={(str) => setJson(str)}/>;
			break;
		default:
			widget = null;
	}
	
	return (
		<Dialog open={open}
				fullWidth
				PaperComponent={PaperComponent}
				aria-labelledby="draggable-task-dialog-title">
			<DialogTitle style={{cursor: 'move'}} id="draggable-task-dialog-title">
				Добавить задание
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
				
				</DialogContentText>
				
				<InputLabel id="select-type">Тип задания</InputLabel>
				<Select fullWidth
						labelId="select-type"
						onChange={({target: {value}}) => onTypeChange(value as number)}
						value={type}
				>
					<MenuItem value={ITaskType.PICK_SINGLE_ANSWER}>
						Вопрос с одним вариантом ответа
					</MenuItem>
					<MenuItem value={ITaskType.PICK_MULTIPLE_ANSWERS}>
						Вопрос с множеством вариантов ответа
					</MenuItem>
					<MenuItem value={ITaskType.FILL_GAPS}>
						Вопрос с заполнением пропусков в тексте
					</MenuItem>
					<MenuItem value={ITaskType.COMPARE_OPTIONS}>
						Вопрос со сравненем двух наборов вариантов
					</MenuItem>
				</Select>
				
				<div className={classes.spacer}/>
				
				<FormControl fullWidth>
					<TextField
						id="input-description"
						label="Описание задания"
						autoComplete="off"
						fullWidth
						required
						inputProps={{
							maxLength: MAX_LENGTH_DESCRIPTION,
						}}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						variant="outlined"
					/>
				</FormControl>
				
				<div className={classes.spacer}/>
				
				<FormControlLabel
					control={
						<Checkbox
							checked={published}
							onChange={() => setPublished(!published)}
							name="chk-published"
							color="primary"
						/>
					}
					label="Опубликован"
				/>
				
				<div className={classes.spacer}/>
				
				{widget}
			
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Закрыть</Button>
				
				<Button onClick={handleSave}
						startIcon={<Save/>}
						variant="contained"
						disabled={!validate()}
						color="primary">Сохранить</Button>
			</DialogActions>
		</Dialog>
	);
};

const WidgetSingleOption: FC<ITaskWidget> = ({data, onJsonUpdate}) => {
	const classes = useStyles();
	const [options, setOptions] = useState<ITaskOption[]>([
		{id: 1, option: ""},
		{id: 2, option: ""},
		{id: 3, option: ""},
		{id: 4, option: ""},
	]);
	const [control, setControl] = useState<number>();
	const [text, setText] = useState<string>("");
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskSingleOption>(data);
			setOptions(parsed.options);
			setControl(parsed.control);
			setText(parsed.text);
		}
	}, []);
	
	useEffect(() => {
		if (!validate()) {
			onJsonUpdate("");
			return;
		}
		const t: ITaskSingleOption = {
			text,
			control: control!,
			options
		};
		console.log("onJsonUpdate", t);
		onJsonUpdate(encodeObjectToBase64(t));
	}, [control, text, options]);
	
	const validate = (): boolean => {
		let valid = true;
		if (options.length < 4 || options.length > MAX_OPTIONS) {
			valid = false;
		}
		if (!Number.isInteger(control)) {
			valid = false;
		}
		if (!text.trim().length || text.length > MAX_LENGTH_TEXT) {
			valid = false;
		}
		options.forEach((o) => {
			if (!o.option.trim()) {
				valid = false;
			}
		});
		return valid;
	};
	
	const deleteOption = (id: number) => {
		const _options = [...options];
		const o = _options.find(option => option.id === id);
		if (!o) {
			return;
		}
		_options.splice(_options.indexOf(o), 1);
		setOptions([..._options]);
		if (control === id) {
			setControl(undefined);
		}
	}
	
	const addOption = () => {
		if (options.length >= MAX_OPTIONS) {
			return;
		}
		setOptions([...options, {
			id: getNewOptionId(options),
			option: ""
		}]);
	};
	
	const onOptionChange = (value: string, id: number) => {
		const _options = [...options];
		const o = _options.find(option => option.id === id);
		if (!o) {
			return;
		}
		o.option = value;
		setOptions([..._options]);
	};
	
	return (
		<>
			<FormControl fullWidth>
				<TextField
					id="input-text"
					label="Текст"
					fullWidth
					required
					autoComplete="off"
					inputProps={{
						maxLength: MAX_LENGTH_TEXT,
					}}
					value={text}
					onChange={(e) => setText(e.target.value)}
					variant="outlined"
				/>
			</FormControl>
			
			<div className={classes.spacer} />
			
			<Divider/>
			
			<div className={classes.spacer} />
			
			{options.map(({id, option}, i) => {
				return (
					<div key={id} className={classes.optionWrap}>
						<TextField
							className={clsx(classes.grow, classes.optionInput)}
							id={"input-option-" + (id + 1)}
							label={"Вариант" + (i + 1)}
							fullWidth
							required
							autoComplete="off"
							inputProps={{
									maxLength: MAX_LENGTH_OPTION
							}}
							value={option}
							onChange={(e) => onOptionChange(e.target.value, id)}
							variant="outlined"
						/>
						
						{i > 3 && <IconButton onClick={() => deleteOption(id)} className={classes.delete} aria-label="delete">
							<Delete fontSize="small" />
						</IconButton>}
						
						<Checkbox
							title={"Правильный вариант"}
							checked={id === control}
							onChange={() => setControl(id)}
							inputProps={{ 'aria-label': 'primary checkbox' }}
						/>
					</div>
				);
			})}
			
			<div className={classes.spacer} />
			
			<Button color="primary"
					size="small"
					onClick={addOption}
					disabled={options.length >= MAX_OPTIONS}
			>Добавить вариант</Button>
			
			
		</>
	);
};

const WidgetMultipleOptions: FC<ITaskWidget> = ({data}) => {
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskMultipleOptions>(data);
		}
	}, []);
	
	return (
		<div>Multiple </div>
	);
};

const WidgetCompareOptions: FC<ITaskWidget> = ({data}) => {
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskCompareOptions>(data);
		}
	}, []);
	
	return (
		<div>Compare </div>
	);
};

const WidgetFillGaps: FC<ITaskWidget> = ({data}) => {
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskFillGaps>(data);
		}
	}, []);
	
	
	return (
		<div>Fill gaps </div>
	);
};