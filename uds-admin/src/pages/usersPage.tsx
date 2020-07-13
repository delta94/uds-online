import React, {lazy, Suspense, useEffect, FC, useState, FormEvent} from "react";
import {useDispatch, useSelector} from "react-redux";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {create_assistant, get_users, popup_snack} from "../actions";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {ComponentSpinner} from "../components/spinner";
import {ROLES} from "../constants";
import {TabLayout} from "../components/tabLayout";
import {PaperComponent} from "../components/confirmDialog";
import {useTranslation} from "react-i18next";
import {Alert} from "@material-ui/lab";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {validate_email} from "../helpers";

const UserTable = lazy(() => import("../components/userTable"));

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 10,
		},
	})
);

interface IAssistantDialogProps {
	open: boolean;
	onClose: () => void;
}

const MAX_LENGTH_EMAIL = 80;
const MAX_LENGTH_NAME = 20;

const AssistantDialog: FC<IAssistantDialogProps> = ({open, onClose}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const [email, setEmail] = useState<string>("");
	const [name, setName] = useState<string>("");
	
	useEffect(() => {
		if (!open) {
			return;
		}
		setEmail("");
		setName("");
	}, [open]);
	
	const isFormValid = (): boolean => {
		let isValid = true;
		if (!email || email.length > MAX_LENGTH_EMAIL || !validate_email(email)) {
			isValid = false;
		}
		if (!name || name.length > MAX_LENGTH_NAME) {
			isValid = false;
		}
		return isValid;
	}
	
	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!isFormValid()) {
			return;
		}
		dispatch(create_assistant(name, email, (result) => {
			if (!result) {
				return;
			}
			dispatch(popup_snack(t('MESSAGES.ASSISTANT_CREATED')));
			dispatch(get_users(ROLES.ROLE_ASSISTANT));
			onClose();
		}));
	};
	
	return (
		<Dialog
			fullWidth
			open={open}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
				{t('PAGE_USERS.ASSISTANT_DIALOG_TITLE')}
			</DialogTitle>
			<DialogContent>
				<form autoComplete="off" onSubmit={onSubmit}>
					<TextField
						id="input-email"
						value={email}
						label={t('COMMON.EMAIL')}
						helperText={t('COMMON.CHARACTERS_LEFT', {ratio: `${email.length}/${MAX_LENGTH_EMAIL}`})}
						fullWidth
						required
						type="email"
						inputProps={{
							maxLength: MAX_LENGTH_EMAIL
						}}
						onChange={(e) => setEmail(e.target.value)}
					/>
					
					<div className={classes.spacer}/>
					
					<TextField
						id="input-name"
						value={name}
						label={t('COMMON.NAME')}
						helperText={t('COMMON.CHARACTERS_LEFT', {ratio: `${name.length}/${MAX_LENGTH_NAME}`})}
						fullWidth
						required
						inputProps={{
							maxLength: MAX_LENGTH_NAME
						}}
						onChange={(e) => setName(e.target.value)}
					/>
					
					<div className={classes.spacer}/>
					
					<Alert severity="info">{t('PAGE_USERS.ASSISTANT_DIALOG_TEXT')}</Alert>
				
				</form>
			</DialogContent>
			<DialogActions>
				<Button type="button"
						color="default"
						onClick={onClose}>{t('BUTTONS.CLOSE')}</Button>&nbsp;
				<Button type="button"
						color="primary"
						disabled={!isFormValid()}
						onClick={onSubmit}
						variant="contained">{t('BUTTONS.CONFIRM')}</Button>
			</DialogActions>
		</Dialog>
	);
};

const TAB_USERS = "TAB_USERS";
const TAB_ASSISTANTS = "TAB_ASSISTANTS";

const UsersPage: FC = () => {
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const [assistantDialogOpen, setAssistantDialogOpen] = useState<boolean>(false);
	const usersState = useSelector((state: IReducerState) => state.users);
	
	useEffect(() => {
		dispatch(get_users(ROLES.ROLE_USER));
		dispatch(get_users(ROLES.ROLE_ASSISTANT));
	}, []);
	
	const handlePageChange = (value: number, role: typeof ROLES.ROLE_USER | typeof ROLES.ROLE_ASSISTANT) => {
		dispatch(get_users(role, value - 1));
	}
	
	return (
		<PageWrapper heading="Учетные записи"
					 actionArea={<Button
						 color='primary'
						 variant='contained'
						 startIcon={<Add/>}
						 onClick={() => setAssistantDialogOpen(true)}
						 type="button">{t('PAGE_USERS.ASSISTANT_DIALOG_TITLE')}</Button>}
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
			<AssistantDialog open={assistantDialogOpen} onClose={() => setAssistantDialogOpen(false)}/>
		</PageWrapper>
	);
}

export default UsersPage;
