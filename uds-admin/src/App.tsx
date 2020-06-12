import React, {lazy, Suspense, useEffect, useState} from 'react';
import "./axios";
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

const LoginPage = lazy(() => import("./pages/loginPage"));
const HomePage = lazy(() => import("./pages/homePage"));
const UsersPage = lazy(() => import("./pages/usersPage"));
const MessagesPage = lazy(() => import("./pages/messagesPage"));
const MessageDetailedPage = lazy(() => import("./pages/messagePage"));
const CoursePage = lazy(() => import("./pages/coursePage"));
const CoursesPage = lazy(() => import("./pages/coursesPage"));
const CourseAddPage = lazy(() => import("./pages/courseAddPage"));
const LessonPage = lazy(() => import("./pages/lessonPage"));
const LessonAddPage = lazy(() => import("./pages/lessonAddPage"));


const NotFoundPage = lazy(() => import("./pages/notFoundPage"));

const {ROLE_ADMIN, ROLE_ASSISTANT} = ROLES;

function App() {
	// const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	const [logged, setLogged] = useState<boolean>(!!authState.token);
	useEffect(() => {
		if (logged !== !!authState.token) {
			setLogged(!!authState.token);
		}
	}, [authState.token]);
	
	return (
		<MuiThemeProvider theme={theme}>
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
									  component={() => <Layout><CourseAddPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.COURSE}
									  component={() => <Layout><CoursePage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.LESSON_ADD}
									  component={() => <Layout><LessonAddPage /></Layout>}
						/>
						<PrivateRoute exact
									  roles={[ROLE_ADMIN]}
									  path={ROUTES.LESSON}
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
