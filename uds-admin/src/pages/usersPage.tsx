import React, {lazy, Suspense, useEffect, FC} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {get_users} from "../actions";
import {Button} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";

const UserTable = lazy(() => import("../components/userTable"));

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		buttonBar: {
			display: 'flex',
			justifyContent: 'flex-start',
			marginBottom: 10
		}
	}),
);

const UsersPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const usersState = useSelector((state: IReducerState) => state.users);
	const pages = Math.ceil(usersState.total / usersState.size) || 1;
	
	useEffect(() => {
		dispatch(get_users());
	}, []);
	
	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		console.log({value});
		dispatch(get_users(value - 1));
	}
	console.log('Rendering page');
	
	return (
		<PageWrapper heading="Пользователи">
			<div className={classes.buttonBar}>
				<Button color='primary' variant='contained' startIcon={<Add/>}>Добавить ассистента</Button>
			</div>
			<Suspense fallback={<ComponentSpinner/>}>
				<UserTable users={usersState.items}
						   page={usersState.page}
						   size={usersState.size}
						   total={usersState.total}
						   onChangePage={handlePageChange}
				/>
			</Suspense>
		</PageWrapper>
	);
}

export default UsersPage;
