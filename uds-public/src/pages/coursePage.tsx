import React, {FC, useEffect, lazy, Suspense, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {withRouter, RouteComponentProps, Link} from "react-router-dom";
import {Button, Divider, Paper, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {get_course} from "../actions";
import {getLessonUrl} from "../helpers/getUrl";
import clsx from "clsx";
import {Alert} from "@material-ui/lab";
import {ComponentSpinner} from "../components/spinner";
import coinsSvg from "../assets/svg/coins.svg";

const ContentObject = lazy(() => import("../components/contentObject"));

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spacer: {
            height: 15
        },
        paper: {
            marginBottom: 10,
        },
        lessonCard: {
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            minHeight: 120,
            [theme.breakpoints.down('xs')]: {
                flexWrap: 'wrap',
            }
        },
        lessonData: {
            paddingLeft: 10,
            paddingRight: 10,
            [theme.breakpoints.down('xs')]: {
                textAlign: 'justify',
                width: '85%',
            }
        },
        disabledCard: {
            color: '#CECECE',
        },
        grow: {
          flexGrow: 1,
        },
        number: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 90,
            flexShrink: 0,
            maxWidth: '15%',
            ['& *']: {
                color: 'inherit',
            },
            [theme.breakpoints.down('xs')]: {
                width: '15%',
            }
        },
        buttonWrap: {
            display: 'flex',
            alignItems: 'center',
            width: 100,
            justifyContent: 'center',
            [theme.breakpoints.down('xs')]: {
                marginTop: 10,
                width: '100%',
                ['& [role="button"]']: {
                    width: '100%',
                },
            }
        },
        availableAfterPurchase: {
            marginTop: 10,
        },
        purchasePaper: {
            color: 'rgb(102, 60, 0)',
            backgroundColor: 'rgb(255, 244, 229)',
            marginBottom: 10
        },
        purchasePaperInner: {
            padding: '10px 10px 5px 10px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 5
        },
        coins: {
            marginRight: 20
        }
    }),
);

interface IRouteProps {
    id: string
}

export const CoursePage: FC<RouteComponentProps<IRouteProps, {}>> = ({match}) => {
    const {params: {id}} = match!;
    const [t] = useTranslation();
    const [title, setTitle] = useState<string>("");
    const [videoContent, setVideoContent] = useState<string>("");
    const [purchased, setPurchased] = useState<boolean>(false);
    const [price, setPrice] = useState<number>(0);
    
    const classes = useStyles();
    const dispatch = useDispatch();
    const lessonsState = useSelector((state: IReducerState) => state.lessons);

    useEffect(() => {
        dispatch(get_course(id, ({video, title, purchased, price}) => {
            setTitle(title);
            setVideoContent(video);
            setPurchased(purchased);
            setPrice(price);
        }));
    }, []);
    
    return (
        <PageWrapper heading={t('TITLES.COURSE', {name: title})}>
            
            {videoContent && <Suspense fallback={<ComponentSpinner/>}>
                <ContentObject wide={true} alias={videoContent} />
            </Suspense>}
    
            {!purchased && <>
                <Paper className={classes.purchasePaper}>
                    <div className={classes.purchasePaperInner}>
                        <img width={30} src={coinsSvg} className={classes.coins} alt="icon"/>
                        <Typography variant="body1">
                            Для получения доступа к платным урокам и их заданиям необходимо приобрести данный курс.<br/>
                            <b>{t('PAGE_COURSE.PAYMENT_MESSAGE', {price})}</b>
                        </Typography>
                    </div>
                    <Button fullWidth variant="contained" color="primary">
                        Купить
                    </Button>
                </Paper>
            </>}
            
            <div className={classes.spacer} />
            
            <Typography variant="h3">{t('PAGE_COURSE.CONTENTS')}</Typography>
            
            <div className={classes.spacer} />
            
            <Divider />
    
            <div className={classes.spacer} />
    
    
            {lessonsState.items && lessonsState.items.map(({ID, title, annotation, paid}, i) => {
                return (
                    <Paper key={ID} className={classes.paper}>
                        <article className={clsx(classes.lessonCard, {[classes.disabledCard]: !purchased && paid})}>
                            <div className={classes.number}>
                                <Typography variant="h3">{i + 1}</Typography>
                            </div>
                            <div className={clsx(classes.lessonData, classes.grow)}>
                                <Typography variant="h6">{title}</Typography>
                                <Typography variant="body1">{annotation}</Typography>
                            </div>
                            <div className={classes.buttonWrap}>
                                <Button
                                    disabled={paid && !lessonsState.purchased}
                                    component={Link}
                                    variant="contained"
                                    color="primary"
                                    to={getLessonUrl(id, String(ID))}
                                >
                                    {t('BUTTONS.MOVE_TO')}
                                </Button>
                            </div>
                        </article>
                        {paid && !purchased && <Alert className={classes.availableAfterPurchase} severity="warning">
                            {t('PAGE_COURSE.LESSON_IS_PAID')}
                        </Alert>}
                    </Paper>
                )
            })}
        </PageWrapper>
    );
}

export default withRouter(CoursePage);
