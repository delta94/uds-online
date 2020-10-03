import React, {FC, useEffect, useState} from "react";
import {IAnswerMultipleOptions, ITaskMultipleOptions, ITaskOption, ITaskWidget} from "../helpers/models";
import {decodeBase64ToObject, encodeObjectToBase64} from "../helpers";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Checkbox, Divider, FormControlLabel, Typography} from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spacer: {
            height: 15
        },
        optionWrap: {
            display: 'flex',
            marginBottom: 10,
            alignItems: 'center'
        },
        optionInput: {
            marginRight: 10,
        },
        grow: {
            flexGrow: 1
        },
        correctAnswer: {
            color: '#008000',
            '& *': {
                fontWeight: '700 !important' as any,
            },
        },
        wrongAnswer: {
            color: '#c10000',
            '& *': {
                fontWeight: '700 !important' as any,
            },
        },
    }),
);

export const WidgetMultipleOptions: FC<ITaskWidget<number[]>> = ({data, givenAnswer, onUpdate}) => {
    const classes = useStyles();
    const [options, setOptions] = useState<ITaskOption[]>([]);
    const [control, setControl] = useState<number[]>([]);
    const [text, setText] = useState<string>("");
    const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

    useEffect(() => {
        if (data) {
            const parsed = decodeBase64ToObject<ITaskMultipleOptions>(data);

            setOptions(parsed.options);
            setText(parsed.text);
            setCorrectAnswers([...parsed.control]);
            if (givenAnswer && givenAnswer.length > 0) {
                setControl([...givenAnswer]);
            }
        }
    }, []);

    useEffect(() => {
        if (!validate()) {
            onUpdate("", null);
            return;
        }
        const t: IAnswerMultipleOptions = {
            control: control!,
        };
        onUpdate(encodeObjectToBase64(t), control);
    }, [control]);



    const validate = (): boolean => {
        let valid = true;
        control.forEach(c => {
            if (!Number.isInteger(c)) {
                valid = false;
            }
        });
        if (!control.length) {
            valid = false;
        }
        return valid;
    };

    const onCheckboxChange = (checked: boolean, value: number) => {
        if (givenAnswer) {
            return;
        }
        const _control = [...control];
        if (checked) {
            _control.push(value);
        }
        else  {
            _control.splice(_control.indexOf(value), 1);
        }
        setControl([..._control]);
    };

    return (
        <>
            <Typography variant='body1'>
                {text}
            </Typography>

            <div className={classes.spacer}/>

            <Divider/>

            <div className={classes.spacer}/>

            {options.map(({id, option}, i) => {
                return (
                    <div key={id} className={classes.optionWrap}>


                        <FormControlLabel
                            value={option}
                            control={
                                <Checkbox
                                    checked={givenAnswer && givenAnswer.includes(id) || control.includes(id)}
                                    color="primary"
                                    onChange={({currentTarget: {checked}}) => onCheckboxChange(checked, id)}
                                    inputProps={{'aria-label': 'primary checkbox'}}
                                />
                            }
                            className={clsx({
                                [classes.correctAnswer]: (givenAnswer && givenAnswer.includes(id)) && correctAnswers.includes(id) || correctAnswers.includes(id),
                                [classes.wrongAnswer]: (givenAnswer && givenAnswer.includes(id)) && !correctAnswers.includes(id),
                            })}
                            label={option}
                            labelPlacement="end"

                        />
                    </div>
                );
            })}
        </>
    );
};

export default WidgetMultipleOptions;
