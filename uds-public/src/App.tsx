import React, {lazy, Suspense, useEffect, useRef, useState} from 'react';
import "./axios";
import {theme} from "./theme";
import {MuiThemeProvider} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "./reducers";
import {Router, Switch, Route} from "react-router-dom";
import SnackbarProvider from "./components/snackbarProvider";
import PrivateRoute from "./components/privateRoute";
import {ROUTES} from "./constants";
import {PageSpinner} from "./components/spinner";
import {Layout} from "./components/layout";
import history from "./history";
import {ITokenPayload} from "./reducers/authReducer";
import {decode as jwtDecode} from "jsonwebtoken";
import {log_out} from "./actions";
import AlertModal from "./components/alertModal";
import {useTranslation} from "react-i18next";

const LoginPage = lazy(() => import("./pages/loginPage"));
const RegisterPage = lazy(() => import("./pages/registerPage"));
const ResetPage = lazy(() => import("./pages/resetPage"));
const ForgotPage = lazy(() => import("./pages/forgotPage"));
const HomePage = lazy(() => import("./pages/homePage"));
const MessagesPage = lazy(() => import("./pages/messagesPage"));
const MessageDetailedPage = lazy(() => import("./pages/messagePage"));
const ComposeMessagePage = lazy(() => import("./pages/composeMessagePage"));
const LessonPage = lazy(() => import("./pages/lessonPage"));
const CoursePage = lazy(() => import("./pages/coursePage"));
const CoursesPage = lazy(() => import("./pages/coursesPage"));


const CHECK_EXPIRATION_INTERVAL_SEC = 5;

function App() {
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const ti = useRef<unknown>();
	const authState = useSelector((state: IReducerState) => state.auth);
	const [logged, setLogged] = useState<boolean>(!!authState.token);
	const [expiredAlertOpen, setExpiredAlertOpen] = useState<boolean>(false);
	
	useEffect(() => {
		if (logged !== !!authState.token) {
			setLogged(!!authState.token);
		}
	}, [authState.token]);
	
	// Notify user when token expired
	useEffect(() => {
		ti.current = setInterval(() => {
			if (logged) {
				const decodedToken = jwtDecode(authState.token || "");
				if (!decodedToken || (decodedToken as ITokenPayload).exp * 1000 < Date.now()) {
					setExpiredAlertOpen(true);
				}
			} else {
				setExpiredAlertOpen(false);
			}
		}, CHECK_EXPIRATION_INTERVAL_SEC * 1000);
		return () => {
			if (ti && ti.current) {
				clearInterval(ti.current as number);
			}
		};
	}, [logged]);
	
	return (
		<MuiThemeProvider theme={theme}>
			<AlertModal
				onClose={() => {
					setExpiredAlertOpen(false);
					dispatch(log_out());
				}}
				open={expiredAlertOpen}
				heading={t('COMMON.WARNING')}
				text={t('MESSAGES.SESSION_EXPIRED')}
			/>
			
			<Router history={history}>
				<Suspense fallback={<PageSpinner/>}>
					<Switch>
						<Route exact path={ROUTES.LOGIN} component={LoginPage}/>
						<Route exact path={ROUTES.SIGNUP} component={RegisterPage}/>
						<Route exact path={ROUTES.RESET} component={ResetPage}/>
						<Route exact path={ROUTES.FORGOT} component={ForgotPage}/>
						<PrivateRoute exact path={ROUTES.ACCOUNT} component={() => <Layout><HomePage /></Layout>}/>
						
						<PrivateRoute exact path={ROUTES.LESSON} component={() => <Layout><LessonPage /></Layout>}/>
						
						<PrivateRoute exact path={ROUTES.COURSE} component={() => <Layout><CoursePage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.COURSES} component={() => <Layout><CoursesPage /></Layout>}/>
						
						<PrivateRoute exact path={ROUTES.MESSAGES} component={() => <Layout><MessagesPage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.MESSAGE} component={() => <Layout><MessageDetailedPage /></Layout>}/>
						
						<PrivateRoute exact path={ROUTES.COMPOSE_MESSAGE} component={() => <Layout><ComposeMessagePage /></Layout>}/>
						
						<Route exact component={() => <div>404</div>}/>
					</Switch>
				</Suspense>
			</Router>
			<SnackbarProvider/>
		</MuiThemeProvider>
	);
}

export default App;
