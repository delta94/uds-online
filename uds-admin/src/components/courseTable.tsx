import React, {FC} from "react";
import {IPagination} from "../helpers/models";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ICourse} from "../reducers/courseReducer";
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import Moment from "moment";
import {Pagination} from "@material-ui/lab";
import {Add} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            minWidth: 650,
        },
        tableContainer: {
            marginBottom: 20,
        },
        textCenter: {
            textAlign: 'center'
        },
        actionColumn: {
            width: '55px'
        }
    }),
);

interface ICourseTableProps extends IPagination {
    courses: ICourse[],
    onChangePage: Function
}

interface ICourseRowProps {
    course: ICourse
}

const CourseRow: FC<ICourseRowProps> = ({course}) => {
    const classes = useStyles();
    const {ID, title, published, price, CreatedAt} = course;

    const created = Moment(CreatedAt).format("DD-MM-YYYY HH:mm");
    return (
        <TableRow key={ID}>
            <TableCell component="th" scope="row">
                {title}
            </TableCell>
            <TableCell align="right">{created}</TableCell>
            <TableCell align="right">{published}</TableCell>
            <TableCell align="right">{price}</TableCell>
            <TableCell align="right"> </TableCell>
        </TableRow>
    )
};

export const CourseTable: FC<ICourseTableProps> = (props) => {
    const classes = useStyles();
    const {courses, page, total, onChangePage, size} = props;
    const count = Math.ceil(total / size) || 1;
    return (
        <div>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell align="right">Создан</TableCell>
                            <TableCell align="right" className={classes.textCenter}>Опубликован</TableCell>
                            <TableCell align="right" className={classes.textCenter}>Стоимость, руб.</TableCell>
                            <TableCell align="right" className={classes.actionColumn}> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses && courses.map((course) => {
                            return (
                                <CourseRow key={course.ID} course={course} />
                            )
                        })}
                        {courses && !courses.length && <TableRow>
                            <TableCell colSpan={5} className={classes.textCenter}>
                                Данных не найдено
                            </TableCell>
                        </TableRow>}
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
    );
}