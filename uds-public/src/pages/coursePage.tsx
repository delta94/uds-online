import React, {FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {RouteChildrenProps } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({}),
);

interface IRouteProps {
    id: string
}

enum TaskType {
    PICK_SINGLE_ANSWER,
    PICK_MULTIPLE_ANSWERS,
    COMPARE_OPTIONS
}

interface TaskData {
    question: string
}

interface TaskSingleAnswerData extends TaskData {
    text: string,
    options: { id: number, option: string}[],
}

interface TaskMultipleAnswersData extends TaskData {

}

interface TaskCompareOptionsData extends TaskData {

}

interface Task {
    type: TaskType,
    data: TaskSingleAnswerData | TaskMultipleAnswersData | TaskCompareOptionsData // going to be serialised from JSON
}

export const CoursePage: FC<RouteChildrenProps<IRouteProps>> = ({match}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const authState = useSelector((state: IReducerState) => state.auth);
    const {params: {id}} = match!;
    console.log(id);

    const tasks: Task[] = [
        {
            type: 1, // 1 - select correct answer, 2 - compare 2 columns
            data: {
                question: 'Выберите правилный вариант',
                text: "That's ___ a good book!"
            },
        }];
    return (
        <PageWrapper heading={`1.1`}>

        </PageWrapper>
    );
}

export default CoursePage;
