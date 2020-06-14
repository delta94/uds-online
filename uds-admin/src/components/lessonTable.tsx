import React, {FC} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IPagination} from "../helpers/models";
import {ILesson} from "../reducers/lessonsReducer";
import {
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import {Link} from "react-router-dom";
import {getCourseUrl, getEditLessonUrl} from "../helpers/getUrl";
import {Edit} from "@material-ui/icons";


const ITEM_HEIGHT = 48;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		table: {
			minWidth: 650,
		},
		tableContainer: {
			marginBottom: 20,
		},
		btnBlock: {
			color: 'red',
		},
		btnUnbLock: {},
		textCenter: {
			textAlign: 'center'
		},
		actionColumn: {
			width: '55px'
		},
		chip: {
			margin: '2px 2px',
		}
	})
);


interface ILessonTableProps extends IPagination {
	course_id: string,
	lessons: ILesson[],
	onChangePage: (e: React.ChangeEvent<unknown>, v: number) => void
}

interface ILessonRowProps {
	course_id: string,
	lesson: ILesson
}

export const LessonRow: FC<ILessonRowProps> = ({course_id, lesson}) => {
	const {ID} = lesson;
	return (
		<>
			<TableRow>
				<TableCell component="th" scope="row">
				
				</TableCell>
				<TableCell align="right"> </TableCell>
				<TableCell align="right"> </TableCell>
				<TableCell align="right"> </TableCell>
				<TableCell align="right">
					<IconButton component={Link} to={getEditLessonUrl(course_id, String(ID))}>
						<Edit />
					</IconButton>
				</TableCell>
			</TableRow>
		</>
	);
}

const LessonTable: FC<ILessonTableProps> = (props) => {
	const classes = useStyles();
	const {course_id, lessons, page, total, onChangePage, size} = props;
	const count = Math.ceil(total / size) || 1;
	
	return (
		<div>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Название</TableCell>
							<TableCell align="right">Платный</TableCell>
							<TableCell align="right">Опубликован</TableCell>
							<TableCell align="right">Заданий</TableCell>
							<TableCell align="right" className={classes.actionColumn}> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{lessons && lessons.map((lesson) => {
							return (
								<LessonRow
									key={lesson.ID}
									course_id={course_id}
									lesson={lesson}
								/>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>
			
			{total > size && <>
				<Pagination count={count}
							page={page + 1}
							hidePrevButton
							hideNextButton
							onChange={(e, i) => onChangePage(e, i)}
				/>
			</>}
		</div>
	)
};

export default LessonTable;