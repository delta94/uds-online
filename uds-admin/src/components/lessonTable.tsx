import React, {FC} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IPagination} from "../helpers/models";
import {ILesson} from "../reducers/lessonsReducer";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";


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
	lessons: ILesson[],
	onChangePage: (e: React.ChangeEvent<unknown>, v: number) => void
}

interface ILessonRowProps {
	lesson: ILesson
}


export const LessonRow: FC<ILessonRowProps> = ({lesson}) => {
	return (
		<>
			<TableRow>
				<TableCell component="th" scope="row">
				
				</TableCell>
				<TableCell align="right"> </TableCell>
				<TableCell align="right"> </TableCell>
				<TableCell align="right"> </TableCell>
			</TableRow>
		</>
	);
}

const LessonTable: FC<ILessonTableProps> = (props) => {
	const classes = useStyles();
	const {lessons, page, total, onChangePage, size} = props;
	const count = Math.ceil(total / size) || 1;
	
	return (
		<div>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell align="right">Создан</TableCell>
							<TableCell align="right" className={classes.actionColumn}> </TableCell>
							<TableCell align="right"> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{lessons && lessons.map((lesson) => {
							return (
								<LessonRow
									key={lesson.ID}
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