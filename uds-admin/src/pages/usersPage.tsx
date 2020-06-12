import React, {lazy, Suspense, useEffect, FC, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {get_users} from "../actions";
import {Box, Button, Tab, Tabs} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";
import {ROLES} from "../constants";

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

interface TabPanelProps {
	children?: React.ReactNode;
	index: any;
	value: any;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<>
					{children}
				</>
			)}
		</div>
	);
}

function a11yProps(index: any) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}


const TAB_USERS = "TAB_USERS";
const TAB_ASSISTANTS = "TAB_ASSISTANTS";
const UsersPage: FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [tab, setTab] = useState(TAB_USERS);
	const usersState = useSelector((state: IReducerState) => state.users);
	
	useEffect(() => {
		dispatch(get_users(ROLES.ROLE_USER));
		dispatch(get_users(ROLES.ROLE_ASSISTANT));
	}, []);
	
	const handlePageChange = (value: number, role: number) => {
		dispatch(get_users(role, value - 1));
	}
	console.log('Rendering page');
	
	return (
		<PageWrapper heading="Учетные записи"
					 actionArea={tab === TAB_ASSISTANTS && <Button
						 color='primary'
						 variant='contained'
						 startIcon={<Add/>}
						 type="button">Добавить ассистента</Button>}
		>
			<Tabs value={tab} onChange={(e, value) => setTab(value)} indicatorColor="primary">
				<Tab value={TAB_USERS} label="Пользователи"{...a11yProps(TAB_USERS)} />
				<Tab value={TAB_ASSISTANTS} label="Ассистенты" {...a11yProps(TAB_ASSISTANTS)} />
			</Tabs>
			<TabPanel value={tab} index={TAB_USERS}>
				<Suspense fallback={<ComponentSpinner/>}>
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
			</TabPanel>
			<TabPanel value={tab} index={TAB_ASSISTANTS}>
				<Suspense fallback={<ComponentSpinner/>}>
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
			</TabPanel>
		</PageWrapper>
	);
}

export default UsersPage;
