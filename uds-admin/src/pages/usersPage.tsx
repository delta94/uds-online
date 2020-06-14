import React, {lazy, Suspense, useEffect, FC} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {get_users} from "../actions";
import {Button} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";
import {ROLES} from "../constants";
import {TabLayout} from "../components/tabLayout";

const UserTable = lazy(() => import("../components/userTable"));

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		buttonBar: {
			display: 'flex',
			justifyContent: 'flex-end',
			marginBottom: 10
		}
	}),
);

const TAB_USERS = "TAB_USERS";
const TAB_ASSISTANTS = "TAB_ASSISTANTS";

const UsersPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const usersState = useSelector((state: IReducerState) => state.users);
	
	useEffect(() => {
		dispatch(get_users(ROLES.ROLE_USER));
		dispatch(get_users(ROLES.ROLE_ASSISTANT));
	}, []);
	
	const handlePageChange = (value: number, role: number) => {
		dispatch(get_users(role, value - 1));
	}
	
	return (
		<PageWrapper heading="Учетные записи"
					 actionArea={<Button
						 color='primary'
						 variant='contained'
						 startIcon={<Add/>}
						 type="button">Добавить ассистента</Button>}
		>
			<TabLayout
				selected={TAB_USERS}
				tabs={[
					{
						id: 1,
						value: TAB_USERS,
						label: "Пользователи",
						panelContent: <Suspense fallback={<ComponentSpinner/>}>
							<UserTable
								role={ROLES.ROLE_USER}
								users={usersState.users.items}
								page={usersState.users.page}
								size={usersState.users.size}
								total={usersState.users.total}
								onChangePage={
									(e: React.ChangeEvent<unknown>, v: number) => handlePageChange(v, ROLES.ROLE_USER)
								}
							/>
						</Suspense>
					},
					{
						id: 2,
						label: "Ассистенты",
						value: TAB_ASSISTANTS,
						panelContent: <Suspense fallback={<ComponentSpinner/>}>
							<UserTable
								role={ROLES.ROLE_ASSISTANT}
								users={usersState.assistants.items}
								page={usersState.assistants.page}
								size={usersState.assistants.size}
								total={usersState.assistants.total}
								onChangePage={
									(e: React.ChangeEvent<unknown>, v: number) => handlePageChange(v, ROLES.ROLE_ASSISTANT)
								}
							/>
						</Suspense>
					}
				]}
			/>
		</PageWrapper>
	);
}

export default UsersPage;
