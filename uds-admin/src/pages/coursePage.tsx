import React, {lazy, FC, Suspense, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps, Link} from "react-router-dom";
import {Button, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";
import {ROLES, ROUTES} from "../constants";
import {getAddLessonUrl} from "../helpers/getUrl";
import {Add} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";
import {get_users} from "../actions";

const LessonTable = lazy(() => import("../components/lessonTable"));

const useStyles = makeStyles((theme: Theme) => {

});

interface IRouteProps {
    id: string
}

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const lessonState = useSelector((state: IReducerState) => state.lessons);
    const {params: {id}} = match!;
    
    const handlePageChange = (value: number) => {
       // dispatch(get_users(value - 1));
    }
    return (
        <PageWrapper
            heading="Редактирование курса"
            actionArea={
                <Button
                    component={Link}
                    color="primary"
                    variant="contained"
                    to={getAddLessonUrl(id)}
                    startIcon={<Add />}>
                    Добавить раздел
                </Button>
            }
        >
    
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
}


export default withRouter(CoursePage);
