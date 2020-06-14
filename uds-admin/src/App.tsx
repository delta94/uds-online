import React, {lazy, Suspense, useEffect, useRef, useState} from 'react';
import "./axios";
import {decode as jwtDecode} from "jsonwebtoken";
import {theme} from "./theme";
import {MuiThemeProvider} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "./reducers";
import {Router, Switch, Route} from "react-router-dom";
import SnackbarProvider from "./components/snackbarProvider";
import PrivateRoute from "./components/privateRoute";
import {ROLES, ROUTES} from "./constants";
import {PageSpinner} from "./components/spinner";
import {Layout} from "./components/layout";
import history from "./history";
import {ITokenPayload} from "./reducers/authReducer";
import AlertModal from "./components/alertModal";
import {log_out} from "./actions";

const LoginPage = lazy(() => import("./pages/loginPage"));
const HomePage = lazy(() => import("./pages/homePage"));
const UsersPage = lazy(() => import("./pages/usersPage"));
const MessagesPage = lazy(() => import("./pages/messagesPage"));
const MessageDetailedPage = lazy(() => import("./pages/messagePage"));
const CoursePage = lazy(() => import("./pages/coursePage"));
const CoursesPage = lazy(() => import("./pages/coursesPage"));
const CourseFormPage = lazy(() => import("./pages/courseFormPage"));
const LessonPage = lazy(() => import("./pages/lessonPage"));
const NotFoundPage = lazy(() => import("./pages/notFoundPage"));

const {ROLE_ADMIN, ROLE_ASSISTANT} = ROLES;
const CHECK_EXPIRATION_INTERVAL_SEC = 5;

function App() {
	const t = useRef<unknown>();
	const dispatch = useDispatch();
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
		t.current = setInterval(() => {
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
			if (t && t.current) {
 				clearInterval(t.current as number);
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
				heading="Внимание!"
				text="Ваша сессия по работе с приложением истекла. Пожалуйста, войдите в систему повторно."
			/>
			
			<Router history={history}>
				<Suspense fallback={<PageSpinner/>}>
					<Switch>
						<Route exact
							   path={ROUTES.LOGIN}
							   component={LoginPage}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN, ROLE_ASSISTANT]}
									  path={ROUTES.HOME}
									  component={() => <Layout><HomePage/></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN, ROLE_ASSISTANT]}
									  path={ROUTES.MESSAGES}
									  component={() => <Layout><MessagesPage/></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN, ROLE_ASSISTANT]}
									  path={ROUTES.MESSAGE}
									  component={() => <Layout><MessageDetailedPage/></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.COURSES}
									  component={() => <Layout><CoursesPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.COURSE_ADD}
									  component={() => <Layout><CourseFormPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.COURSE_EDIT}
									  component={() => <Layout><CourseFormPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.COURSE}
									  component={() => <Layout><CoursePage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.LESSON_ADD}
									  component={() => <Layout><LessonPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.LESSON_EDIT}
									  component={() => <Layout><LessonPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.USERS}
									  component={() => <Layout><UsersPage /></Layout>}
						/>
						<Route exact component={() => <Layout><NotFoundPage /></Layout>}/>
					</Switch>
				</Suspense>
			</Router>
			<SnackbarProvider/>
		</MuiThemeProvider>
	);
}

export default App;
