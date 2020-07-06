import React, {FC} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {ICourse} from "../reducers/courseReducer";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@material-ui/core";
import Moment from "moment";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {Link} from "react-router-dom";
import {getCourseUrl} from "../helpers/getUrl";

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

interface ICourseTableProps {
    courses: ICourse[]
}

interface ICourseRowProps {
    course: ICourse
}

const CourseRow: FC<ICourseRowProps> = ({course}) => {
    const classes = useStyles();
    const {ID, title, published, price, CreatedAt} = course;

    const created = Moment(CreatedAt).format("DD-MM-YYYY HH:mm");
    return (
        <TableRow>
            <TableCell component="th" scope="row">
                {title}
            </TableCell>
            <TableCell align="center">{created}</TableCell>
            <TableCell align="center">
                {published ?
                    <Visibility titleAccess="Элемент опубликован"/>
                    :
                    <VisibilityOff titleAccess="Элемент не опубликован"/>
                }
            </TableCell>
            <TableCell align="center">{price}</TableCell>
            <TableCell align="right">
                <Button component={Link} to={getCourseUrl(ID.toString())} variant="contained" color="primary">
                    Перейти
                </Button>
            </TableCell>
        </TableRow>
    )
};

const CourseTable: FC<ICourseTableProps> = ({courses}) => {
    const classes = useStyles();
    return (
        <div>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell align="center">Создан</TableCell>
                            <TableCell align="center">Опубликован</TableCell>
                            <TableCell align="center">Стоимость, руб.</TableCell>
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
        </div>
    );
};

export default CourseTable;
