import React, {useState, useEffect, FC, ElementType} from "react";
import {Redirect, Route, RouteProps} from "react-router-dom";
import {useSelector} from "react-redux";
import {ROUTES} from "../constants";
import {IReducerState} from "../reducers";

export interface IPrivateRouteProps {
	component: ElementType,
}

const PrivateRoute: FC<IPrivateRouteProps & RouteProps> = ({component: Component, ...rest}) => {
	const authState = useSelector((state: IReducerState) => state.auth);
	const [isAuthenticated, setAuthenticated] = useState<boolean>(!!authState.token);
	
	useEffect(() => {
		if (isAuthenticated !== !!authState.token) {
			setAuthenticated(!!authState.token);
		}
	}, [authState.token]);
	
	return (
		<Route
			{...rest}
			render={props => isAuthenticated ?
				(
					<Component {...props} />
				)
				:
				(
					<Redirect to={{pathname: ROUTES.LOGIN, state: {referer: props.location}}}/>
				)
			}
		/>
	);
}

export default PrivateRoute;
