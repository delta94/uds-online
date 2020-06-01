import React, {ChangeEvent, FC, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import parse from "html-react-parser";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps } from "react-router-dom";
import {Button, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gapInput: {
            outline: 'none',
            border: 0,
            borderBottom: '1px solid #cecece',
            minWidth: '2em',
            width: '2em',
            fontSize: '1rem',
            padding: '0 0.2em',
            textAlign: 'center',
            // fontFamily: 'Monospace'
        }
    }),
);

interface IRouteProps {
    id: string
}

enum ITaskType {
    PICK_SINGLE_ANSWER,
    PICK_MULTIPLE_ANSWERS,
    COMPARE_OPTIONS,
    FILL_GAPS
}

interface ITaskData {
}

interface ITaskSingleAnswerData extends ITaskData {
    text: string,
    options: { id: number, option: string }[],
}

interface ITaskMultipleAnswersData extends ITaskData {

}

interface ITaskCompareOptionsData extends ITaskData {
    text?: string,
    options: {
        col_a: { id: number, option: string }[],
        col_b: { id: number, option: string }[],
    },
}

// ==================================================================

interface ITaskFillGapsData extends ITaskData {
    text: string
}

interface IGapInputProps {
    input: string
}
const GapInput: FC<IGapInputProps> = ({input}) => {
    const classes = useStyles();
    const [answer] = useState<string>(input);
    const [width, setWidth] = useState<number>();
    const [value, setValue] = useState<string>("");
    useEffect(() => {
    
    }, [input]);
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
        const {length} = event.target.value;
        if (length > 0) {
            setWidth(length * 0.6);
        }
        
    };
    return (
        <>
            <input maxLength={50}  spellCheck="false" onChange={handleChange} type="text" className={classes.gapInput} style={{width: `${width}em`}} />
        </>
    )
}

// ==================================================================

interface ITask {
    id: number,
    question: string,
    type: ITaskType,
    data: ITaskSingleAnswerData | ITaskMultipleAnswersData | ITaskCompareOptionsData | ITaskFillGapsData // going to be serialised from JSON
}

interface ITaskWidgetProps {
    task: ITask
}

const TaskWidget: FC<ITaskWidgetProps> = ({task}) => {
    let widget;
    
    switch (task.type) {
        case ITaskType.PICK_SINGLE_ANSWER: {
            const d = task.data as ITaskSingleAnswerData;
            widget = (
                
                <CardContent>
                    <Typography variant="body1">{d.text}</Typography>
                    <Divider />
                    {d.options.map((o) => {
                        return (
                            <button key={o.id}>
                                {o.option}
                            </button>
                        )
                    })}
                </CardContent>
            )
            break;
        }
        case ITaskType.PICK_MULTIPLE_ANSWERS: {
            const d = task.data as ITaskMultipleAnswersData;
            widget = (
                <CardContent>
                    multi
                </CardContent>
            )
            break;
        }
        case ITaskType.COMPARE_OPTIONS: {
            const d = task.data as ITaskCompareOptionsData;
            widget = (
                <CardContent>
                    <Typography variant="body1">{d.text}</Typography>
                    <Divider />
                    
                    {d.options.col_a.map((o) => {
                        return (
                            <button key={o.id}>
                                {o.option}
                            </button>
                        )
                    })}
                    
                    {d.options.col_b.map((o) => {
                        return (
                            <button key={o.id}>
                                {o.option}
                            </button>
                        )
                    })}
                
                </CardContent>
            )
            break;
        }
        case ITaskType.FILL_GAPS: {
            const d = task.data as ITaskFillGapsData;
            const p = (parse(d.text.replace(/{{\[(.*)\]}}/g, '<span text-value="$1"></span>')) as JSX.Element[])
                .map((el, key) => {
                    if (!el.props) {
                        return el;
                    }
                    const videoObject = el.props['text-value'];
                    if (videoObject) {
                        return <GapInput key={key} input={videoObject.trim()} />
                    }
                    return el;
                });
            widget = (
                <CardContent>
                    <Typography variant="body1">{p}</Typography>
                </CardContent>
            )
            break;
        }
    }
    return (
        <article>
            <Card>
                <CardHeader title={task.question}/>
                {widget}
                <Divider />
                <Button color='primary'>Подтвердить</Button>
            </Card>
        </article>
    );
};

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const authState = useSelector((state: IReducerState) => state.auth);
    const {params: {id}} = match!;
    console.log(id);
    
    const tasks: ITask[] = [
        {
            id: 1,
            type: ITaskType.PICK_SINGLE_ANSWER, // 1 - select correct answer, 2 - compare 2 columns
            question: 'Выберите правилный вариант.',
            data: {
                text: "That's ___ a good book!",
                options: [
                    {
                        id: 1,
                        option: "such"
                    },
                    {
                        id: 2,
                        option: "the"
                    },
                    {
                        id: 3,
                        option: "-"
                    },
                    {
                        id: 4,
                        option: "very"
                    },
                
                ]
            },
        },
        {
            id: 2,
            type: ITaskType.COMPARE_OPTIONS,
            question: "Сопоставьте слова и значения",
            data: {
                options: {
                    col_a: [
                        {
                            id: 1,
                            option: 'a car'
                        },
                        {
                            id: 2,
                            option: 'water'
                        },
                        {
                            id: 3,
                            option: 'Javascript'
                        },
                        {
                            id: 4,
                            option: 'a elephant'
                        },
                    ],
                    col_b: [
                        {
                            id: 2,
                            option: 'a vehicle'
                        },
                        {
                            id: 3,
                            option: 'a programming language'
                        },
                        {
                            id: 4,
                            option: 'an African animal'
                        },
                        {
                            id: 5,
                            option: 'a liquid'
                        },
                    ],
                }
            }
        },
        {
            id:3,
            type: ITaskType.FILL_GAPS,
            question: 'Заполните пробелы',
            data: {
                text: `Тестовое1 {{[предложение]}}, которое служит демонстрацией функционала отображающего
                слова и2 {{[заменяющего]}} одно и более из них на так-называемые плейсхолдеры.
                 Тестовое предложение, которое3 {{[служит]}} демонстрацией функционала отображающего
                слова и заменяющего одно и более из них на так-называемые плейсхолдеры.
                 Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно и более из них на так-называемые4 {{[плейсхолдеры]}}.
                 Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно и более из них5 {{[на]}} так-называемые плейсхолдеры.
                Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно и более из них на так-называемые плейсхолдеры.
                 1111
                 Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно и более из них на так-называемые плейсхолдеры.
                 222
                 Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно и более из них на так-называемые плейсхолдеры.
                 333
                 Тестовое предложение, которое служит демонстрацией функционала отображающего
                слова и заменяющего одно10 {{[и]}} более из них на так-называемые плейсхолдеры.
                 444
                 `
            }
        }
    ];
    // {JSON.stringify(tasks)}
    
    return (
        <PageWrapper heading={`1.1`}>
            {tasks.map((t) => {
                return (
                    <TaskWidget key={t.id} task={t}/>
                )
            })}
        </PageWrapper>
    );
}


export default withRouter(CoursePage);
