import React, {ChangeEvent, FC, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import parse from "html-react-parser";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps, Link} from "react-router-dom";
import {Button, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";
import {ROUTES} from "../constants";
import {getAddLessonUrl} from "../helpers/getUrl";
import {Add} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => {

});

interface IRouteProps {
    id: string
}

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const authState = useSelector((state: IReducerState) => state.auth);
    const {params: {id}} = match!;
  
    return (
        <PageWrapper
            heading={`1.1`}
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
        
        
        </PageWrapper>
    );
}


export default withRouter(CoursePage);
