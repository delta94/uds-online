import React, {FC, useEffect, useState} from "react";
import {ITaskCompareOptions, ITaskWidget, NullableTaskOption, SelectionPair} from "../helpers/models";
import {Delete} from '@material-ui/icons';
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {decodeBase64ToObject, encodeObjectToBase64} from "../helpers";
import {Button, Divider, FormControl, IconButton, TextField} from "@material-ui/core";
import {isNumber, isFinite, times, cloneDeep} from "lodash";
import {useTranslation} from "react-i18next";

const MAX_LENGTH_TEXT = 500;
const MAX_ROWS = 12;
const MAX_LENGTH_EXPLANATION = 300;
const MAX_LENGTH_OPTION = 80;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spacer: {
            height: 15
        },
        buttons: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        grow: {
            flexGrow: 2
        },
        table: {
            width: '100%',
            marginBottom: 10,
        },
        cellInput: {
            width: '50%',
            paddingTop: 10
        },
        delete: {
            color: 'red'
        },
        cellDelete: {
            paddingTop: 10,
        },
    })
);

export const WidgetCompareOptions: FC<ITaskWidget> = ({data, onJsonUpdate}) => {
    const classes = useStyles();
    const [optionsA, setOptionsA] = useState<NullableTaskOption[]>([]);
    const [optionsB, setOptionsB] = useState<NullableTaskOption[]>([]);
    const [text, setText] = useState<string>("");
    const [explanation, setExplanation] = useState<string>("");
    const [rowNumber, setRowNumber] = useState<number>(5);
    const [control, setControl] = useState<SelectionPair[]>([]);
    const [t] = useTranslation();
    
    
    useEffect(() => {
        if (data) {
            const parsed = decodeBase64ToObject<ITaskCompareOptions>(data);
            if (parsed.text) {
                setText(parsed.text);
            }
            if (parsed.explanation) {
                setExplanation(parsed.explanation);
            }
            setOptionsA(parsed.optionsA);
            setOptionsB(parsed.optionsB);
            setControl(parsed.control);
        }
    }, []);
    
    useEffect(() => {
        setControl(getControlValues(optionsA, optionsB, rowNumber));
    }, [optionsA, optionsB, rowNumber]);
    
    useEffect(() => {
        setRowNumber(Math.max(optionsA.length, optionsB.length));
        
        if (!validate()) {
            onJsonUpdate("");
            return;
        }
        const t: ITaskCompareOptions = {
            text,
            optionsA,
            optionsB,
            control,
            explanation
        };
        onJsonUpdate(encodeObjectToBase64(t));
    }, [optionsA, optionsB, text, control, explanation]);
    
    const getControlValues = (setA: NullableTaskOption[], setB: NullableTaskOption[], count: number): SelectionPair[] => {
        const control: SelectionPair[] = [];
        for (let i = 0; i < count; i++) {
            if (optionsA[i] && optionsB[i]) {
                control.push([optionsA[i]!.id, optionsB[i]!.id]);
            }
        }
        return control;
    };
    
    const validate = () : boolean => {
        let valid = true;
        if (!optionsA.length || !optionsB.length) {
            valid = false;
        }
        [...optionsA, ...optionsB].forEach(o => {
            if (!o) {
                return;
            }
            if (!o.option || !o.option.length || !o.id) {
                valid = false;
            }
        });
        return valid;
    };
    
    const getNewId = (setA: NullableTaskOption[], setB: NullableTaskOption[]): number => {
        const IDsA = setA.map(o => o ? o.id : 0);
        const IDsB = setB.map(o => o ? o.id : 0);
        const max = Math.max(...IDsA, ...IDsB);
        return (isNumber(max) && isFinite(max) ? max : 0) + 3;
    };
    
    const addOptionsAB = () => {
        if (rowNumber >= MAX_ROWS) {
            return;
        }
        const _optionsA: NullableTaskOption[] = [...cloneDeep(optionsA), {id: getNewId(optionsA, optionsB), option: 'aa1'}];
        const _optionsB: NullableTaskOption[] = [...cloneDeep(optionsB), {id: getNewId(_optionsA, optionsB), option: 'bb1'}];
        setOptionsA(_optionsA);
        setOptionsB(_optionsB);
    };
    
    const addOptionB = () => {
        if (rowNumber >= MAX_ROWS) {
            return;
        }
        const _optionsA: NullableTaskOption[] = [...cloneDeep(optionsA), null];
        const _optionsB: NullableTaskOption[] = [...cloneDeep(optionsB), {id: getNewId(optionsA, optionsB), option: 'bb2'}];
        setOptionsA(_optionsA);
        setOptionsB(_optionsB);
    };
    
    const onOptionTextChange = (value: string, o: NullableTaskOption) => {
        if (!o) {
            return;
        }
        o.option = value;
        setOptionsA([...optionsA]);
        setOptionsB([...optionsB]);
    };
    
    const onDelete = (id: number): void => {
        const _optionsA: NullableTaskOption[] = [...cloneDeep(optionsA)];
        const _optionsB: NullableTaskOption[] = [...cloneDeep(optionsB)];
        _optionsA.splice(id, 1);
        _optionsB.splice(id, 1);
        setOptionsA(_optionsA);
        setOptionsB(_optionsB);
    };
    
    return (
        <>
            <FormControl fullWidth>
                <TextField
                    id="input-text"
                    label="Текст"
                    fullWidth
                    autoComplete="off"
                    inputProps={{
                        maxLength: MAX_LENGTH_TEXT,
                    }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    variant="outlined"
                />
            </FormControl>
    
            <div className={classes.spacer} />
    
            <FormControl fullWidth>
                <TextField
                    id="input-explanation"
                    label="Пояснение"
                    fullWidth
                    autoComplete="off"
                    inputProps={{
                        maxLength: MAX_LENGTH_EXPLANATION,
                    }}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    variant="outlined"
                />
            </FormControl>
    
            <div className={classes.spacer} />
    
            <Divider/>
            
            <table className={classes.table}>
                <tbody>
                {times(rowNumber, (i) => {
                    const cellA = optionsA[i] ? <td className={classes.cellInput}>
                        {optionsA[i] ?
                            <FormControl fullWidth>
                                <TextField
                                    id={"input-text"+i}
                                    label="Вариант"
                                    fullWidth
                                    required
                                    autoComplete="off"
                                    inputProps={{
                                        maxLength: MAX_LENGTH_OPTION,
                                    }}
                                    value={optionsA[i]!.option}
                                    onChange={(e) => {
                                        onOptionTextChange(e.target.value, optionsA[i])
                                    }}
                                    variant="outlined"
                                />
                            </FormControl> : null}
                    </td>: <td className={classes.cellInput} />
                    const cellB = optionsB[i] ? <td className={classes.cellInput}>
                        {optionsB[i] ?
                            <FormControl fullWidth>
                                <TextField
                                    id={"input-text-answer" + i}
                                    label="Ответ"
                                    fullWidth
                                    required
                                    autoComplete="off"
                                    inputProps={{
                                        maxLength: MAX_LENGTH_OPTION,
                                    }}
                                    value={optionsB[i]!.option}
                                    onChange={(e) => {
                                        onOptionTextChange(e.target.value, optionsB[i])
                                    }}
                                    variant="outlined"
                                />
                            </FormControl> : null}
                    </td>: <td className={classes.cellInput} />
                    return (
                        <tr key={'row' + i}>
                            {cellA}
                            {cellB}
                            <td className={classes.cellDelete}>
                                <IconButton
                                    className={classes.delete}
                                    onClick={() => onDelete(i)}
                                    title={t('BUTTONS.DELETE')}
                                >
                                    <Delete fontSize='small'/>
                                </IconButton>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
            
            <div className={classes.buttons}>
                <Button
                    disabled={rowNumber >= MAX_ROWS}
                    onClick={addOptionsAB}
                    color="primary"
                    variant="text">Добавить вариант-ответ</Button>
    
                <Button
                    disabled={rowNumber >= MAX_ROWS}
                    onClick={addOptionB}
                    color="primary"
                    variant="text">Добавить только вариант</Button>
            </div>
        </>
    );
};

export default WidgetCompareOptions;
