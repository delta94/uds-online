import React, {FC, useEffect, useState} from "react";
import {PageWrapper} from "../components/pageWrapper"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {ROUTES} from "../constants";
import {Save, Info, FileCopy} from "@material-ui/icons";
import {Alert} from "@material-ui/lab";
import {useDispatch} from "react-redux";
import history from "../history";
import {IUser} from "../reducers/usersReducer";
import {getCourseUrl} from "../helpers/getUrl";
import {ICourse} from "../reducers/courseReducer";
import {useTranslation} from "react-i18next";
import PictureCropDialog from "../components/pictureCropDialog";
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
import {
    clone_course,
    create_course,
    get_assistants_plain,
    get_course,
    popup_snack,
    update_course,
    upload_file
} from "../actions";

const MAX_LENGTH_TITLE = 80;
const MIN_LENGTH_TITLE = 10;
const MAX_LENGTH_ANNOTATION = 350;
const MIN_LENGTH_ANNOTATION = 10;
const MAX_PRICE_VALUE = 99999;
const MIN_PRICE_VALUE = 100;
const VIDEO_KEY_LENGTH = 12;

const PICTURE_WIDTH = 200;
const PICTURE_RATIO = 16 / 9;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        row: {
            display: 'flex',
        },
        pictureCell: {
            width: PICTURE_WIDTH,
            flexShrink: 0,
            marginRight: 20
        },
        pictureContainer: {
            border: '1px solid #CECECE',
            marginBottom: 10,
            height: PICTURE_WIDTH / PICTURE_RATIO,
            width: PICTURE_WIDTH
        },
        spacer: {
            height: 20,
        },
        grow: {
            flexGrow: 1
        },
        buttonBar: {
            padding: '10px 0',
            display: 'flex'
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
    const [pictureDialogOpen, setPictureDialogOpen] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [picture, setPicture] = useState<string>("");
    const [annotation, setAnnotation] = useState<string>("");
    const [assistantID, setAssistantID] = React.useState<string>("");
    const [assistants, setAssistants] = React.useState<IUser[]>([]);
    const [price, setPrice] = useState<number>(1000);
    const [published, setPublished] = useState<boolean>(false);
    const [video, setVideo] = useState<string>("");
    
    const dispatch = useDispatch();
    const [t] = useTranslation();
    
    useEffect(() => {
        dispatch(get_assistants_plain((assistants) => {
            setAssistants(assistants);
            if (course_id) {
                // prefetch course data
                dispatch(get_course(course_id, (c => {
                    setAnnotation(c.annotation);
                    setTitle(c.title);
                    setAssistantID(c.assistant_id);
                    setPublished(c.published);
                    setPrice(c.price);
                    setPicture(c.picture);
                    setVideo(c.video);
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
        if (video.length !== VIDEO_KEY_LENGTH) {
            isValid = false;
        }
        return isValid;
    };

    const onSubmit = (e: React.SyntheticEvent | React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
           return;
        }
        const c: ICourse = {
            annotation,
            assistant_id: assistantID,
            published,
            purchased: false, // ????
            title,
            picture,
            price,
            video,
            lessons: []
        };
        if (course_id) {
            // update course
            c.ID = Number(course_id);
            dispatch(update_course(c, () => {
                dispatch(popup_snack(`Курс "${title}" успешно обновлен`));
                history.push(getCourseUrl(course_id));
            }));
            return;
        }
        // create post
        dispatch(create_course(c, (course) => {
            dispatch(popup_snack(`Курс "${course.title}" был успешно создан`));
            history.push(ROUTES.COURSES);
        }));
    };
    
    const onClone = () => {
        if (course_id) {
            dispatch(clone_course(Number(course_id), () => {
                dispatch(popup_snack(t("MESSAGES.COURSE_CLONED_SUCCESSFUL")));
                history.push(ROUTES.COURSES);
            }));
        }
    };
    
    const onChangePicture = async (blobURL: string) => {
        setPictureDialogOpen(false);
        const blob = await fetch(blobURL).then(r => r.blob());
    
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('comment', 'Изображение для раздела (загружено автоматически)');
        dispatch(upload_file(formData, {}, (result, path) => {
            if (result) {
                setPicture(path!);
            } else {
            }
        }));
    };

    return (
        <PageWrapper heading={course_id ? "Редактирование курса" : "Добавить курс"}>
            <form onSubmit={onSubmit} autoComplete="off">
                <div className={classes.row}>
                    <div className={classes.pictureCell}>
                        <div className={classes.pictureContainer}>
                            {picture ?
                                <img src={process.env.REACT_APP_HOST_API + '/' + picture} alt=""
                                     width={PICTURE_WIDTH}
                                     height={PICTURE_WIDTH / PICTURE_RATIO}
                                />
                                :
                                null
                            }
                        </div>
                        <Button
                            fullWidth
                            variant='contained'
                            color='primary'
                            onClick={() => setPictureDialogOpen(true)}>
                            Select picture
                        </Button>
                    </div>
                    
                    <div className={classes.grow}>
                        
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
                                                    {a.name} [{a.email}]
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

                    </div>
                </div>
                
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
                        required
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
    
                <FormControl fullWidth>
                    <TextField
                        id="input-video"
                        value={video}
                        fullWidth
                        required
                        label="Вводное видео"
                        helperText={`Ссылка на видео ресурс`}
                        inputProps={{
                            max: VIDEO_KEY_LENGTH,
                            min: VIDEO_KEY_LENGTH
                        }}
                        onChange={(e) => setVideo(e.target.value)}
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
                    <Button component={Link}
                            to={course_id ? getCourseUrl(course_id) : ROUTES.COURSES}
                            className={classes.cancelBtn}>
                        {t("BUTTONS.CANCEL")}
                    </Button>

                    <Button disabled={!isFormValid()}
                            type="submit"
                            startIcon={<Save/>}
                            variant="contained"
                            color="primary">
                        {course_id ? t("BUTTONS.SAVE"): t("BUTTONS.SAVE")}
                    </Button>
                    
                    {course_id && <>
                        <div className={classes.grow}/>
    
                        <Button type="button"
                                startIcon={<FileCopy/>}
                                variant="contained"
                                onClick={onClone}
                                color="default">
                            {t("BUTTONS.CLONE")}
                        </Button>
                    </>}
                </div>
            </form>
            
            <PictureCropDialog
                open={pictureDialogOpen}
                onSave={onChangePicture}
                onClose={() => setPictureDialogOpen(false)}
            />
        </PageWrapper>
    );
};

export default withRouter(CourseFormPage);
