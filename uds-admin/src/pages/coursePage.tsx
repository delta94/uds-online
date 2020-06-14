import React, {lazy, FC, Suspense, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {RouteComponentProps, Link, withRouter} from "react-router-dom";
import {Button} from "@material-ui/core";

import {getAddLessonUrl, getEditCourseUrl} from "../helpers/getUrl";
import {Add, Visibility, VisibilityOff, Edit} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";

import {Alert, AlertTitle} from "@material-ui/lab";
import {ROUTES} from "../constants";
import {get_course} from "../actions";

const LessonTable = lazy(() => import("../components/lessonTable"));


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        buttonBar: {
            ['& > *']: {
                marginLeft: 5,
            }
        },
        publishAlert: {
            marginBottom: 10,
        },
        btnPublish: {
            color: theme.palette.success.contrastText,
            backgroundColor: theme.palette.success.light,
            ['&:hover']: {
                backgroundColor: theme.palette.success.main,
            }
        }
    })
);

interface IRouteProps {
    id: string
}

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [published, setPublished] = useState<boolean>(true);
    const lessonState = useSelector((state: IReducerState) => state.lessons);
    const {params: {id}} = match!;
    
    useEffect(() => {
        dispatch(get_course(id, (c => {
            setPublished(c.published);
        })));
    }, []);
    
    const handlePageChange = (value: number) => {
       // dispatch(get_users(value - 1));
    }
    
    const buttonArea = <div className={classes.buttonBar}>
        <Button
            startIcon={<Edit/>}
            component={Link}
            to={getEditCourseUrl(id)}
            color="primary"
            variant="contained">
            Редактировать
        </Button>
        <Button
            component={Link}
            color="primary"
            variant="contained"
            to={getAddLessonUrl(id)}
            startIcon={<Add />}>
            Добавить раздел
        </Button>
    </div>;
    
    return (
        <PageWrapper
            heading="Содержание курса"
            actionArea={buttonArea}
        >
            {!published && <Alert severity="warning" className={classes.publishAlert}>
                <AlertTitle>Внимание</AlertTitle>
                Данный курс находится в не опубликованном состоянии. Чтобы опубликовать его, перейдите в раздел "Редактировать".
            </Alert>}
            
            <Suspense fallback={<ComponentSpinner/>}>
                <LessonTable
                    total={lessonState.total}
                    size={lessonState.size}
                    page={lessonState.page}
                    lessons={lessonState.items}
                    onChangePage={
                        (e: React.ChangeEvent<unknown>, v: number) => handlePageChange(v)
                    }
                />
            </Suspense>
        </PageWrapper>
    );
};

export default withRouter(CoursePage);
