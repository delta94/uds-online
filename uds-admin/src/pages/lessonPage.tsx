import React, {FC, FormEvent, lazy, Suspense, useEffect, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
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
import {ComponentSpinner} from "../components/spinner";
import {getCourseUrl} from "../helpers/getUrl";
import {Save} from "@material-ui/icons";
import {TabLayout} from "../components/tabLayout";

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
			padding: '10px 0'
		},
		cancelBtn: {
			color: 'red',
			marginRight: 10
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
	const [content, setContent] = useState<string>("");
	const [published, setPublished] = useState<boolean>(true);
	const [paid, setPaid] = useState<boolean>(true);
	
	useEffect(() => {
		if (lesson_id) {
			console.log("ID ", lesson_id);
		}
	}, []);
	
	const onContentChange = (value: string) => {
		setContent(value);
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
	const onSubmit = (e: FormEvent) => {
		if (!isFormValid()) {
			e.preventDefault();
			return;
		}
		
	};
	
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
						content={content}
						onChange={onContentChange}
						options={{
							minLines: 15,
							maxLines: 15,
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
		<div className={classes.spacer}/>
		<Divider/>
		<div className={classes.buttonBar}>
			<Button component={Link} to={getCourseUrl(course_id)} className={classes.cancelBtn}>Отмена</Button>
			<Button disabled={!isFormValid()}
					type="submit"
					startIcon={<Save/>}
					variant="contained"
					color="primary">Создать</Button>
		</div>
	</>
	
	const tabContentTasks = <>
		<Typography>
			Менеджер заданий
		</Typography>
	</>
	
	return (
		<PageWrapper heading={lesson_id ? "Редактирование раздела" : "Добавить раздел"}>
			<form autoComplete="off" spellCheck="false" onSubmit={onSubmit}>
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
			</form>
		</PageWrapper>
	);
};

export default withRouter(LessonPage);