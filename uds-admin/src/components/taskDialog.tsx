import React, {FC, lazy, Suspense, useEffect, useState} from "react";
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {PaperComponent} from "./confirmDialog";
import {ITaskType} from "../helpers/models";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Save} from "@material-ui/icons";
import {ILessonTask} from "../reducers/lessonsReducer";
import {ComponentSpinner} from "./spinner";
import {delay} from "../helpers";
import {useTranslation} from "react-i18next";

const WidgetSingleOption = lazy(() => import("./widgetSingleOption"));
const WidgetMultipleOptions = lazy(() => import("./widgetMultipleOptions"));
const WidgetCompareOptions = lazy(() => import("./widgetCompareOptions"));
const WidgetFillGaps = lazy(() => import("./widgetFillGaps"));


const MAX_LENGTH_DESCRIPTION = 300;
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
	const [type, setType] = useState<ITaskType>(ITaskType.NONE);
	const [json, setJson] = useState<string>("");
	const [sort, setSort] = useState<number>(0);
	const [published, setPublished] = useState<boolean>(true);
	const [typeSelectable, setTypeSelectable] =  useState<boolean>(true);
	const [t] = useTranslation();
	
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
	
	useEffect(() => {
		// on render]
		if (!open) {
			return;
		}
		if (task) {
			setTypeSelectable(false);
		}
		if (!task) {
			reset();
		}
	}, [open]);
	
	const onTypeChange = (value: number) => {
		setType(value);
		if (value !== ITaskType.NONE) {
			delay(100).then(() => setTypeSelectable(false));
		}
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
		setType(ITaskType.NONE);
		setSort(0);
		setTypeSelectable(true);
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
			widget = <Suspense fallback={<ComponentSpinner />}>
				<WidgetSingleOption data={json} onJsonUpdate={(str) => setJson(str)}/>
			</Suspense>;
			break;
		case ITaskType.PICK_MULTIPLE_ANSWERS:
			widget = <Suspense fallback={<ComponentSpinner />}>
				<WidgetMultipleOptions data={json} onJsonUpdate={(str) => setJson(str)}/>
			</Suspense>;
			break;
		case ITaskType.FILL_GAPS:
			widget = <Suspense fallback={<ComponentSpinner />}>
				<WidgetFillGaps data={json} onJsonUpdate={(str) => setJson(str)}/>
			</Suspense>;
			break;
		case ITaskType.COMPARE_OPTIONS:
			widget = <Suspense fallback={<ComponentSpinner />}>
				<WidgetCompareOptions data={json} onJsonUpdate={(str) => setJson(str)}/>
			</Suspense>;
			break;
		default:
			widget = null;
	}
	
	return (
		<Dialog open={open}
				fullWidth
				PaperComponent={PaperComponent}
				aria-labelledby={"draggable-dialog-title"}>
			<DialogTitle style={{cursor: 'move'}} id={"draggable-dialog-title"}>
				{task ? "Редактировать задание" : "Добавить задание"}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
				
				</DialogContentText>
				
				<InputLabel id="select-type">Тип задания {!typeSelectable && <>(выбрано)</>}</InputLabel>
				<Select fullWidth
						inputProps={{
							disabled: !typeSelectable
						}}
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
				
				{type === ITaskType.NONE ? <Alert severity="info">{t('PAGE_LESSONS.SELECT_TASK_TYPE_TEXT')}</Alert>
					:
					<>
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
					</>
				}
				
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
