import React, {lazy, Suspense, useEffect, useState} from 'react';
import "./axios";
import {theme} from "./theme";
import {MuiThemeProvider} from "@material-ui/core";
import {useSelector} from "react-redux";
import {IReducerState} from "./reducers";
import {Router, Switch, Route} from "react-router-dom";
import SnackbarProvider from "./components/snackbarProvider";
import PrivateRoute from "./components/privateRoute";
import {ROUTES} from "./constants";
import {Spinner} from "./components/spinner";
import {Layout} from "./components/layout";
import history from "./history";

const LoginPage = lazy(() => import("./pages/loginPage"));
const RegisterPage = lazy(() => import("./pages/registerPage"));
const ResetPage = lazy(() => import("./pages/resetPage"));
const ForgotPage = lazy(() => import("./pages/forgotPage"));
const HomePage = lazy(() => import("./pages/homePage"));
const MessagesPage = lazy(() => import("./pages/messagesPage"));
const MessageDetailedPage = lazy(() => import("./pages/messagePage"));
const ComposeMessagePage = lazy(() => import("./pages/composeMessagePage"));
const CoursePage = lazy(() => import("./pages/coursePage"));

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
				<Suspense fallback={<Spinner/>}>
					<Switch>
						<Route exact path={ROUTES.LOGIN} component={LoginPage}/>
						<Route exact path={ROUTES.SIGNUP} component={RegisterPage}/>
						<Route exact path={ROUTES.RESET} component={ResetPage}/>
						<Route exact path={ROUTES.FORGOT} component={ForgotPage}/>
						<PrivateRoute exact path={ROUTES.ACCOUNT} component={() => <Layout><HomePage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.MESSAGES} component={() => <Layout><MessagesPage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.MESSAGE} component={() => <Layout><MessageDetailedPage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.COMPOSE_MESSAGE} component={() => <Layout><ComposeMessagePage /></Layout>}/>
						<PrivateRoute exact path={ROUTES.COURSE} component={() => <Layout><CoursePage /></Layout>}/>
						<Route exact component={() => <div>404</div>}/>
					</Switch>
				</Suspense>
			</Router>
			<SnackbarProvider/>
		</MuiThemeProvider>
	);
}

export default App;
