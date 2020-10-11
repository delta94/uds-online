import React, {FC, Suspense, useEffect} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "../reducers";
import {get_courses} from "../actions";
import {ComponentSpinner} from "../components/spinner";
import {Button, Paper, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import {getCourseUrl} from "../helpers/getUrl";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Alert} from "@material-ui/lab";

const B_BUTTONS_HEIGHT = 36;
const CONTENT_PADDING = 10;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			marginBottom: 10,
			padding: 0,
			display: 'flex',
			minHeight: 208,
			
			[theme.breakpoints.down('xs')]: {
				display: 'block'
			}
		},
		content: {
			padding: CONTENT_PADDING,
			paddingBottom: CONTENT_PADDING + B_BUTTONS_HEIGHT,
			position: 'relative',
			width: '100%',
			[theme.breakpoints.down('xs')]: {
				paddingBottom: CONTENT_PADDING,
			}
		},
		buttons: {
			height: B_BUTTONS_HEIGHT,
			bottom: CONTENT_PADDING,
			position: 'absolute',
			left: 0,
			right: 0,
			paddingLeft: CONTENT_PADDING,
			paddingRight: CONTENT_PADDING,
			display: 'flex',
			justifyContent: 'flex-end',
			[theme.breakpoints.down('xs')]: {
				position: 'static',
				marginTop: 10
			}
		},
		img: {
			objectFit: 'contain',
			maxWidth: '40%',
			width: 350,
			[theme.breakpoints.down('xs')]: {
				display: 'block',
				maxWidth: '100%',
				margin: '0 auto'
			}
		},
	}),
);

interface ICoursesPage {

}

const IMG_SRC_PREFIX = process.env[process.env.NODE_ENV === 'production' ? '' : 'REACT_APP_HOST_API'] + '/';

const CoursesPage: FC<ICoursesPage> = () => {
	const [t] = useTranslation();
	const classes = useStyles();
	const dispatch = useDispatch();
	const courseState = useSelector((state: IReducerState) => state.course);
	
	useEffect(() => {
		dispatch(get_courses());
	}, []);
	
	return (
		<PageWrapper heading={t('TITLES.COURSES')}>
			<Suspense fallback={<ComponentSpinner/>}>
				{courseState.data && courseState.data.map((course) => {
					const {ID, title, picture, annotation} = course;
					return (
						<Paper className={classes.paper} key={ID}>
							<img className={classes.img} src={IMG_SRC_PREFIX + picture} alt={title}/>
							<div className={classes.content}>
								<Typography variant="h6">
									{title}
								</Typography>
								<Typography variant="body1">
									{annotation}
								</Typography>
								
								<div className={classes.buttons}>
									<Button to={getCourseUrl(ID!)} color="primary" component={Link}>
										{t('BUTTONS.OPEN')}
									</Button>
								</div>
							</div>
							
						</Paper>
					)
				})}
				{courseState.data && !courseState.data.length && <Alert>
					{t('PAGE_COURSES.NO_COURSES_FOUND')}
				</Alert>}
			</Suspense>
		</PageWrapper>
	);
};

export default CoursesPage;
