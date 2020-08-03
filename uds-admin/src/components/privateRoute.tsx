import React, {useState, useEffect, FC, ElementType} from "react";
import {Redirect, Route, RouteProps} from "react-router-dom";
import {useSelector} from "react-redux";
import {ROUTES} from "../constants";
import {IReducerState} from "../reducers";

export interface IPrivateRouteProps {
	component: ElementType,
	roles: number[]
}

const PrivateRoute: FC<IPrivateRouteProps & RouteProps> = ({component: Component, roles, ...rest}) => {
	const authState = useSelector((state: IReducerState) => state.auth);
	const [isAuthenticated, setAuthenticated] = useState<boolean>(!!authState.token);
	const [role] = useState<number|undefined>(authState.role);
	
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
					roles.includes(role!)? <Component {...props} /> : <Redirect to={{pathname: ROUTES.HOME}}/>
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