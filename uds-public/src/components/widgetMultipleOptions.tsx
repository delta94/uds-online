import React, {FC, useEffect, useState} from "react";
import {ITaskMultipleOptions, ITaskOption, ITaskWidget} from "../helpers/models";
import {decodeBase64ToObject} from "../helpers";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {   Checkbox, Divider, FormControl,    TextField} from "@material-ui/core";
import clsx from "clsx";

const MAX_LENGTH_TEXT = 500;
const MAX_LENGTH_OPTION = 80;
const MAX_OPTIONS = 8;

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
        delete: {
            color: 'red'
        }
    }),
);

export const WidgetMultipleOptions: FC<ITaskWidget> = ({data, onJsonUpdate}) => {
    const classes = useStyles();
    const [options, setOptions] = useState<ITaskOption[]>([
        {id: 1, option: ""},
        {id: 2, option: ""},
        {id: 3, option: ""},
        {id: 4, option: ""},
    ]);
    const [control, setControl] = useState<number[]>([]);
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (data) {
            const parsed = decodeBase64ToObject<ITaskMultipleOptions>(data);
            setOptions(parsed.options);
            setControl(parsed.control);
            setText(parsed.text);
        }
    }, []);

    useEffect(() => {
        if (!validate()) {
           // onJsonUpdate("");
            return;
        }
        const t: ITaskMultipleOptions = {
            text,
            control: control!,
            options
        };
        //onJsonUpdate(encodeObjectToBase64(t));
    }, [control, text, options]);

    const validate = (): boolean => {
        let valid = true;
        if (options.length < 4 || options.length > MAX_OPTIONS) {
            valid = false;
        }
        if (control.length < 1) {
            valid = false;
        }
        if (!text.trim().length || text.length > MAX_LENGTH_TEXT) {
            valid = false;
        }
        options.forEach((o) => {
            if (!o.option.trim()) {
                valid = false;
            }
        });
        return valid;
    };
    
    const onOptionChange = (value: string, id: number) => {
        const _options = [...options];
        const o = _options.find(option => option.id === id);
        if (!o) {
            return;
        }
        o.option = value;
        setOptions([..._options]);
    };

    const onControlChange = (checked: boolean, value: number) => {
        if (!checked) {
            const _control = [...control];
            _control.splice(_control.indexOf(value), 1);
            setControl([..._control]);
            return;
        }
        setControl([...control, value]);
    };

    return (
        <>
            <FormControl fullWidth>
                <TextField
                    id="input-text"
                    label="Текст"
                    fullWidth
                    required
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

            <Divider/>

            <div className={classes.spacer} />

            {options.map(({id, option}, i) => {
                return (
                    <div key={id} className={classes.optionWrap}>
                        <TextField
                            className={clsx(classes.grow, classes.optionInput)}
                            id={"input-option-" + (id + 1)}
                            label={"Вариант" + (i + 1)}
                            fullWidth
                            required
                            autoComplete="off"
                            inputProps={{
                                maxLength: MAX_LENGTH_OPTION
                            }}
                            value={option}
                            onChange={(e) => onOptionChange(e.target.value, id)}
                            variant="outlined"
                        />
 

                        <Checkbox
                            title={"Правильный вариант"}
                            checked={Array.isArray(control) && control.includes(id)}
                            onChange={({currentTarget: {checked}}) => onControlChange(checked, id)}
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>
                );
            })}
 


        </>
    );
};

export default WidgetMultipleOptions;
