import React, {FC, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps, Link} from "react-router-dom";
import {Button, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {get_course} from "../actions";
import {getLessonUrl} from "../helpers/getUrl";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({}),
);

interface IRouteProps {
    id: string
}

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const {params: {id}} = match!;
    const [t] = useTranslation();
    
    const classes = useStyles();
    const dispatch = useDispatch();
    const lessonsState = useSelector((state: IReducerState) => state.lessons);

    useEffect(() => {
        dispatch(get_course(id, () => {}));
    }, []);
    
    return (
        <PageWrapper heading={t('')}>
            {lessonsState.items && lessonsState.items.map(({ID, title, annotation, paid}) => {
                return (
                    <div key={ID}>
                        <h5>{title}</h5>
                        <p>{annotation}</p>
                        <Button
                            disabled={paid && !lessonsState.purchased}
                            component={Link}
                            to={getLessonUrl(id, String(ID))}>
                            Открыть
                        </Button>
                    </div>
                )
            })}
        </PageWrapper>
    );
}

export default withRouter(CoursePage);