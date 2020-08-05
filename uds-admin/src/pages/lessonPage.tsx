import React, {FC, FormEvent, lazy, Suspense, useEffect, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ComponentSpinner} from "../components/spinner";
import {getCourseUrl, getPreviewLessonUrl} from "../helpers/getUrl";
import {Save, OpenInNew} from "@material-ui/icons";
import {TabLayout} from "../components/tabLayout";
import {useDispatch} from "react-redux";
import {create_lesson, get_lesson, popup_snack, update_lesson} from "../actions";
import history from "../history";
import {ILesson, ILessonTask} from "../reducers/lessonsReducer";
import {TaskPreview} from "../components/taskPreview";
import {TaskDialog} from "../components/taskDialog";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";

import clsx from "clsx";
import {
	Button,
	Checkbox,
	Divider,
	FormControl,
	FormControlLabel,
	Paper,
	TextField,
	Typography
} from "@material-ui/core";
import {Sortable} from "../helpers/models";

const HtmlEditor = lazy(() => import("../components/htmlEditor"));
const MAX_LENGTH_TITLE = 80;
const MIN_LENGTH_TITLE = 5;
const MAX_LENGTH_ANNOTATION = 300;
const MIN_LENGTH_ANNOTATION = 5;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
		buttonBar: {
			padding: '10px 0',
			display: 'flex'
		},
		cancelBtn: {
			color: 'red',
		},
		button: {
			marginRight: 10
		},
		grow: {
			flexGrow: 1,
		},
		editorWrap: {
			padding: '5px 3px'
		},
		editorHeading: {
			marginBottom: 5,
			color: 'rgba(0, 0, 0, 0.54)'
		}
	}),
);

interface IRouteProps {
	course_id: string,
	lesson_id?: string
}

const TAB_MAIN = "TAB_MAIN";
const TAB_TASKS = "TAB_TASKS";

const LessonPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
	const {params: {course_id, lesson_id}} = match!;
	const classes = useStyles();
	const [title, setTitle] = useState<string>("");
	const [annotation, setAnnotation] = useState<string>("");
	const [body, setBody] = useState<string>("");
	const [published, setPublished] = useState<boolean>(true);
	const [paid, setPaid] = useState<boolean>(true);
	const [contentID, setContentID] = useState<number>();
	const [tasks, setTasks] = useState<ILessonTask[]>([]);
	const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
	const dispatch = useDispatch();
	
	useEffect(() => {
		if (lesson_id) {
			preload();
		}
	}, []);
	
	const preload = () => {
		dispatch(get_lesson(Number(lesson_id), (lesson) => {
			const {title, content, annotation, paid, published} = lesson;
			setTitle(title);
			setAnnotation(annotation);
			setPaid(paid);
			setPublished(published);
			setBody(content!.body);
			setTasks(content!.tasks);
			setContentID(content!.ID)
		}));
	};
	
	const onContentChange = (value: string) => {
		setBody(value);
	};
	
	const isFormValid = (): boolean => {
		let isValid = true;
		if (!title.trim() || title.length < MIN_LENGTH_TITLE || title.length > MAX_LENGTH_TITLE) {
			isValid = false;
		}
		if (!annotation.trim() || annotation.length < MIN_LENGTH_ANNOTATION || annotation.length > MAX_LENGTH_ANNOTATION) {
			isValid = false;
		}
		
		return isValid;
	};
	
	const handleSave = (task: ILessonTask) => {
		if (!Number.isInteger(task.ID)) {
			// New task
			const max = Math.max(...tasks.map(t => t.sort));
			task.ID = 0;
			task.sort = Number.isInteger(max) ? max + 10 : 0;
			setTasks([...tasks, task]);
		} else {
			// Existing task
			const _tasks = [...tasks];
			let o = _tasks.find(t => t.ID === task.ID)!;
			if (!o) {
				return;
			}
			_tasks.splice(_tasks.indexOf(o), 1);
			setTasks([..._tasks, {...task}]);
		}
		setTaskDialogOpen(false);
	};
	
	const onSubmit = (e: FormEvent, stay?: boolean) => {
		e.preventDefault();
		if (!isFormValid()) {
			return;
		}
		const lesson: ILesson = {
			annotation,
			course_id: Number(course_id),
			title,
			paid,
			published,
			content: {
				body,
				tasks
			}
		};
		if (lesson_id) {
			lesson.ID = Number(lesson_id);
			lesson!.content!.ID = contentID;
			dispatch(update_lesson(lesson, () => {
				dispatch(popup_snack(`Раздел ${title} успешно обновлен`));
				if (!stay) {
					history.push(getCourseUrl(course_id));
				} else {
					preload();
				}
			}));
			return;
		}
		dispatch(create_lesson(lesson, (lesson) => {
			dispatch(popup_snack(`Раздел ${lesson.title} успешно создан`));
			history.push(getCourseUrl(course_id));
		}));
	};
	
	const sortedTasks = (tasks: ILessonTask[]): ILessonTask[] => {
		return tasks.sort((a, b) => {
			if (a.sort > b.sort) {
				return 1;
			}
			if (a.sort < b.sort) {
				return -1;
			}
			return 0;
		});
	}
	
	function reorder<T>(list: Sortable<T>[], startIndex: number, endIndex: number): T[] {
		const result: Sortable<T>[] = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		let sort = 0
		result.forEach(r => {
			r.sort = sort;
			sort += 10;
		});
		return result;
	}
	
	const onDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}
		const items = reorder<ILessonTask>(
			sortedTasks(tasks),
			result.source.index,
			result.destination.index
		);
		setTasks(items);
	}
	
	const tabContentMain = <>
		<FormControl fullWidth>
			<TextField
				id="input-title"
				value={title}
				label="Название раздела"
				helperText={`${title.length}/${MAX_LENGTH_TITLE} символов. Минимальная длинна ${MIN_LENGTH_TITLE} символов.`}
				fullWidth
				required
				inputProps={{
					maxLength: MAX_LENGTH_TITLE,
					minLength: MIN_LENGTH_TITLE,
				}}
				onChange={(e) => setTitle(e.target.value)}
			/>
		</FormControl>
		
		<div className={classes.spacer}/>
		
		<FormControl fullWidth>
			<TextField
				id="textarea-annotation"
				label="Краткое описание"
				FormHelperTextProps={{variant: "standard"}}
				multiline
				fullWidth
				required
				helperText={`${annotation.length}/${MAX_LENGTH_ANNOTATION} символов. Минимальная длинна ${MIN_LENGTH_ANNOTATION} символов.`}
				rows={3}
				inputProps={{
					maxLength: MAX_LENGTH_ANNOTATION,
					minLength: MIN_LENGTH_ANNOTATION,
				}}
				value={annotation}
				onChange={(e) => setAnnotation(e.target.value)}
				variant="outlined"
			/>
		</FormControl>
		
		<div className={classes.spacer}/>
		
		<FormControl fullWidth>
			<Suspense fallback={<ComponentSpinner/>}>
				<Paper variant="outlined" className={classes.editorWrap}>
					<Typography variant="subtitle1" className={classes.editorHeading}>
						Содержание раздела (HTML)
					</Typography>
					<HtmlEditor
						name="content-editor"
						content={body}
						onChange={onContentChange}
						options={{
							minLines: 25,
							maxLines: 25,
							showPrintMargin: false,
							enableLiveAutocompletion: true,
							enableBasicAutocompletion: false,
							enableSnippets: false,
							tabSize: 2,
							fontSize: 14,
						}}
					/>
				</Paper>
			</Suspense>
		</FormControl>
		
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
		<FormControlLabel
			control={
				<Checkbox
					checked={paid}
					onChange={() => setPaid(!paid)}
					name="chk-paid"
					color="primary"
				/>
			}
			label="Платный раздел"
		/>
	</>
	
	const tabContentTasks = <>
		<Button variant="contained"
				color="primary"
				onClick={() => setTaskDialogOpen(true)}
				fullWidth>
			Добавить задание
		</Button>
		
		<Divider />
		
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
					>
						{tasks && sortedTasks(tasks).map((task, i) => {
							return (
								<Draggable key={i + String(task.ID)} draggableId={i + String(task.ID)} index={i}>
									{(provided) => (
										<div ref={provided.innerRef}
											  {...provided.draggableProps}
											  {...provided.dragHandleProps}>
											<TaskPreview task={task} onSave={handleSave}/>
										</div>
									)}
								</Draggable>
							)
						})}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
		
		
		<TaskDialog open={taskDialogOpen}
					onClose={() => setTaskDialogOpen(false)}
					onSave={handleSave}
		/>
	</>
	
	return (
		<PageWrapper heading={lesson_id ? "Редактирование раздела" : "Добавить раздел"}>
			<form autoComplete="off" spellCheck="false" onSubmit={(e) => onSubmit(e)}>
				<TabLayout
					selected={TAB_MAIN}
					tabs={[
						{
							id: 1,
							label: "Основные параметры",
							value: TAB_MAIN,
							panelContent: tabContentMain
						},
						{
							id: 2,
							label: "Задания",
							value: TAB_TASKS,
							panelContent: tabContentTasks
						}
					]}
				/>
				
				<div className={classes.spacer}/>
				
				<Divider/>
				
				<div className={classes.buttonBar}>
					<Button component={Link}
							to={getCourseUrl(course_id)}
							className={clsx(classes.cancelBtn, classes.button)}>Отмена</Button>
					
					<Button disabled={!isFormValid()}
							type="submit"
							className={clsx(classes.button)}
							startIcon={<Save/>}
							variant="contained"
							color="primary">
						{lesson_id ? "Сохранить" : "Создать"}
					</Button>
					
					{lesson_id && <Button
						disabled={!isFormValid()}
						type="button"
						className={clsx(classes.button)}
						onClick={(e) => onSubmit(e, true)}
						startIcon={<Save/>}
						variant="contained"
						color="primary">
						Применить
					</Button>}
					
					<div className={classes.grow} />
					
					{lesson_id && <Button component={Link}
										  target="_blank"
										  to={getPreviewLessonUrl(course_id, lesson_id)}
										  variant="contained"
										  startIcon={<OpenInNew />}
										  color="default">Предпросмотр</Button>
					}
				</div>
				
			</form>
		</PageWrapper>
	);
};

export default withRouter(LessonPage);