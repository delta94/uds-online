import React, {FC, useEffect, useRef, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    TextField,
    InputLabel,
    Tooltip
} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {ROUTES} from "../constants";
import {Save, Info} from "@material-ui/icons";
import {Alert} from "@material-ui/lab";
import {useDispatch, useSelector} from "react-redux";
import {create_course, get_assistants, get_course, popup_snack, update_course} from "../actions";
import history from "../history";
import {IUser} from "../reducers/usersReducer";
import {getCourseUrl} from "../helpers/getUrl";
import {ICourse} from "../reducers/courseReducer";

const MAX_LENGTH_TITLE = 80;
const MIN_LENGTH_TITLE = 10;
const MAX_LENGTH_ANNOTATION = 700;
const MIN_LENGTH_ANNOTATION = 10;
const MAX_PRICE_VALUE = 9000;
const MIN_PRICE_VALUE = 100;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spacer: {
            height: 20,
        },
        buttonBar: {
            padding: '10px 0'
        },
        cancelBtn: {
            color: 'red',
            marginRight: 10
        },
        tooltipRow: {
            display: 'flex',
            alignItems: 'center'
        },
        assistantSelect: {
            flexGrow: 1,
            marginRight: 10,
        }
    }),
);

interface IRouteProps {
    id?: string
}

const CourseFormPage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const classes = useStyles();
    const {params: {id: course_id}} = match!;
    const [title, setTitle] = useState<string>("");
    const [annotation, setAnnotation] = useState<string>("");
    const [assistantID, setAssistantID] = React.useState<string>("");
    const [assistants, setAssistants] = React.useState<IUser[]>([]);
    const [price, setPrice] = useState<number>(1000);
    const [published, setPublished] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [oldState, setOldState] = useState<ICourse | undefined>();
    
    useEffect(() => {
        dispatch(get_assistants((assistants) => {
            setAssistants(assistants);
            if (course_id) {
                // prefetch course data
                dispatch(get_course(course_id, (c => {
                    setAnnotation(c.annotation);
                    setTitle(c.title);
                    setAssistantID(c.assistant_id);
                    setPublished(c.published);
                    setPrice(c.price);
                    setOldState(c);
                })));
            }
        }));
    }, []);
    
    const isFormValid = (): boolean => {
        let isValid = true;
        if (!title.trim() || title.length < MIN_LENGTH_TITLE || title.length > MAX_LENGTH_TITLE) {
            isValid = false;
        }
        if (!annotation.trim() || annotation.length < MIN_LENGTH_ANNOTATION || annotation.length > MAX_LENGTH_ANNOTATION) {
            isValid = false;
        }
        if (!assistantID.trim()) {
            isValid = false;
        }
        if (price < MIN_PRICE_VALUE || price > MAX_PRICE_VALUE) {
            isValid = false;
        }
        // check if any change's been done
        if (course_id
            && oldState
            && title.trim() === oldState.title
            && price === oldState.price
            && annotation.trim() === oldState.annotation
            && assistantID === oldState.assistant_id
            && published === oldState.published
        ) {
            isValid = false;
        }
        return isValid;
    };

    const onSubmit = (e: React.SyntheticEvent | React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
           return;
        }
        if (course_id) {
            // update course
            dispatch(update_course(Number(course_id), title, annotation, price, assistantID, published, () => {
                dispatch(popup_snack(`Курс "${title}" успешно обновлен`));
                history.push(getCourseUrl(course_id));
            }));
        } else {
            // create post
            dispatch(create_course(title, annotation, price, assistantID, (course) => {
                dispatch(popup_snack(`Курс "${course.title}" был успешно создан`));
                history.push(ROUTES.COURSES);
            }));
        }
    };

    return (
        <PageWrapper heading={course_id ? "Редактирование курса" : "Добавить курс"}>
            <form onSubmit={onSubmit} autoComplete="off">
                <FormControl fullWidth>
                    <TextField
                        id="input-title"
                        value={title}
                        label="Название курса"
                        helperText={`${title.length}/${MAX_LENGTH_TITLE} символов. Минимальная длинна ${MIN_LENGTH_TITLE} символов.`}
                        fullWidth
                        required
                        inputProps={{
                            maxLength: MAX_LENGTH_TITLE,
                            minLength: MIN_LENGTH_TITLE,
                        }}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormControl>
                
                <div className={classes.spacer}/>

                <FormControl fullWidth>
                    <div className={classes.tooltipRow}>
                        <div className={classes.assistantSelect}>
                            <InputLabel id="select-assistant">Назначеный ассистент</InputLabel>
                            <Select
                                required
                                fullWidth
                                labelId="select-assistant"
                                value={assistantID}
                                onChange={({target}) => setAssistantID(String(target.value))}
                            >
                                {assistants && assistants.map((a) => {
                                    return (
                                        <MenuItem key={a.ID} value={a.ID}>
                                            {a.email} &bull; [ ID: {a.ID} ]
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </div>

                        <Tooltip title={
                            `Указанный аккаунт будет получать на проверку задания из данного курса, а также 
                             сообщения из него. Новый ассистент может быть добавлен в разделе "Учетные записи".`
                        }>
                            <Info/>
                        </Tooltip>
                    </div>
                </FormControl>

                <div className={classes.spacer}/>
                <div className={classes.spacer}/>

                <FormControl fullWidth>
                    <TextField
                        id="textarea-annotation"
                        label="Краткое описание"
                        multiline
                        FormHelperTextProps={{variant:"standard"}}
                        fullWidth
                        required
                        helperText={`${annotation.length}/${MAX_LENGTH_ANNOTATION} символов. Минимальная длинна ${MIN_LENGTH_ANNOTATION} символов.`}
                        rows={4}
                        inputProps={{
                            maxLength: MAX_LENGTH_ANNOTATION,
                            minLength: MIN_LENGTH_ANNOTATION,
                        }}
                        value={annotation}
                        onChange={(e) => setAnnotation(e.target.value)}
                        variant="outlined"
                    />
                </FormControl>

                <div className={classes.spacer}/>

                <FormControl fullWidth>
                    <TextField
                        id="input-price"
                        value={price}
                        fullWidth
                        label="Стоимость курса, руб."
                        helperText={`От ${MIN_PRICE_VALUE} до ${MAX_PRICE_VALUE} руб.`}
                        inputProps={{
                            type: "number",
                            max: MAX_PRICE_VALUE,
                            min: MIN_PRICE_VALUE
                        }}
                        onChange={(e) => setPrice(parseInt(e.target.value, 10) || MIN_PRICE_VALUE)}
                    />
                </FormControl>

                <div className={classes.spacer}/>

                {!course_id ?
                    <Alert severity="info">
                        Внимание! По-умолчанию, созданый курс находится в не опубликованном состоянии.
                    </Alert>
                    :
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={published}
                                onChange={() => setPublished(!published)}
                                name="chk-published"
                                color="primary"
                            />
                        }
                        label="Опубликован"
                    />
                }
    
                <div className={classes.spacer}/>

                <Divider/>

                <div className={classes.buttonBar}>
                    <Button component={Link} to={ROUTES.COURSES} className={classes.cancelBtn}>Отмена</Button>

                    <Button disabled={!isFormValid()}
                            type="submit"
                            startIcon={<Save/>}
                            variant="contained"
                            color="primary">
                        {course_id ? "Сохранить": "Создать"}
                    </Button>
                </div>
            </form>

        </PageWrapper>
    );
};

export default withRouter(CourseFormPage);