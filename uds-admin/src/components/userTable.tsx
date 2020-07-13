import React, {FC, useState} from 'react';
import {
	Button,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from "@material-ui/core";

import {MoreVert, NotInterested, Done} from "@material-ui/icons";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IUser} from "../reducers/usersReducer";
import Moment from 'moment';
import {Pagination} from "@material-ui/lab";
import {IPagination} from "../helpers/models";
import {ConfirmDialog} from "./confirmDialog";
import {useDispatch} from "react-redux";
import {change_block, get_users, manual_email_confirm, popup_snack} from "../actions";
import {ROLES} from "../constants";


const ITEM_HEIGHT = 48;
const MSG_BLOCK_USER = "Указанная учетная запись будет заблокирована. Её нельзя будет использовать для входа в систему до тех пор, пока вы её не разблокируете. Продолжить?";
const MSG_CONF_EMAIL = "Указанный для данной учетной записи Email будет отмечен как подтвержденный. Продолжить?";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		table: {
			[theme.breakpoints.down(theme.breakpoints.values.md)]: {
				width: 600
			}
		},
		tableContainer: {
			marginBottom: 20,
		},
		btnBlock: {
			color: 'red',
		},
		btnUnbLock: {},
		textCenter: {
			textAlign: 'center'
		},
		actionColumn: {
			width: '55px'
		},
		chip: {
			margin: '2px 2px',
		}
	})
);


interface IUserTableProps extends IPagination {
	users: IUser[],
	role: typeof ROLES.ROLE_USER | typeof ROLES.ROLE_ASSISTANT,
	onChangePage:  (e: React.ChangeEvent<unknown>, v: number) => void,
}

interface IUserRowProps {
	user: IUser,
	role: typeof ROLES.ROLE_USER | typeof ROLES.ROLE_ASSISTANT
}

const UserRow: FC<IUserRowProps> = ({user, role}) => {
	const classes = useStyles();
	const [selectedUserID, setUserID] = useState<string | null>("");
	// for menu
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [blockModalOpen, setBlockModal] = useState<boolean>(false);
	const [emailModalOpen, setEmailModal] = useState<boolean>(false);
	const dispatch = useDispatch();
	const open = Boolean(anchorEl);
	
	const onModalClose = () => {
		setUserID(null);
		setBlockModal(false);
		setEmailModal(false);
	};
	
	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};
	
	const onBlockClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
		handleMenuClose();
		setUserID(id);
		setBlockModal(true);
	};
	
	const handleEmailConfirm = () => {
		if (selectedUserID) {
			dispatch(manual_email_confirm(selectedUserID, () => {
				dispatch(popup_snack("Email для указанного аккаунта успешно подтвержден"));
				dispatch(get_users(role));
			}));
		}
		onModalClose();
	};
	
	const handleBlockUser = () => {
		if (selectedUserID) {
			dispatch(change_block(selectedUserID, true, () => {
				dispatch(popup_snack("Пользователь успешно заблокирован"));
				dispatch(get_users(role));
			}));
		}
		onModalClose();
	};
	
	const onUnblockClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
		handleMenuClose();
		if (id) {
			dispatch(change_block(id, false, () => {
				dispatch(popup_snack("Пользователь успешно разблокирован"));
				dispatch(get_users(role));
			}));
		}
		onModalClose();
	};
	
	const onEmailConfirmClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
		handleMenuClose();
		setUserID(id);
		setEmailModal(true);
	};
	
	const created = Moment(user.CreatedAt).format("DD-MM-YYYY HH:mm");
	return (
		<>
			<TableRow>
				<TableCell component="th" scope="row">
					{user.email}&nbsp;
					{!user.confirmed && <Chip className={classes.chip} label="Не подтвержден" size="small" />}
					{user.is_blocked && <Chip className={classes.chip} label="Заблокирован" size="small"/>}
				</TableCell>
				<TableCell align="center">{created}</TableCell>
				<TableCell align="right" className={classes.actionColumn}>
					<IconButton
						aria-label="more"
						aria-controls="long-menu"
						aria-haspopup="true"
						onClick={handleMenuOpen}
					>
						<MoreVert/>
					</IconButton>
					<Menu
						id={'menu-' + user.ID}
						anchorEl={anchorEl}
						keepMounted
						open={open}
						onClose={handleMenuClose}
						PaperProps={{
							style: {
								maxHeight: ITEM_HEIGHT * 4.5
							},
						}}
					>
						<MenuItem disabled={user.confirmed}
								  onClick={(e) => onEmailConfirmClick(e, user.ID)}>
							<Done fontSize="small"/>&nbsp;Подтвердить Email
						</MenuItem>
						{user.is_blocked && <MenuItem
							className={classes.btnUnbLock}
							onClick={(e) => onUnblockClick(e, user.ID)}>
							Разблокировать
						</MenuItem>}
						
						{!user.is_blocked && <MenuItem
							className={classes.btnBlock}
							onClick={(e) => onBlockClick(e, user.ID)}>
							<NotInterested fontSize="small"/>&nbsp;Заблокировать
						</MenuItem>}
					</Menu>
				</TableCell>
			</TableRow>
			
			<ConfirmDialog
				heading="Блокировка пользователя"
				open={blockModalOpen}
				text={MSG_BLOCK_USER}>
				
				<Button onClick={onModalClose}>Отмена</Button>
				
				<Button onClick={handleBlockUser}
						color="primary"
						variant="contained">Подтвердить</Button>
			</ConfirmDialog>
			
			<ConfirmDialog
				heading="Ручное подтверждение Email"
				open={emailModalOpen}
				text={MSG_CONF_EMAIL}>
				
				<Button onClick={onModalClose}>Отмена</Button>
				
				<Button onClick={handleEmailConfirm}
						color="primary"
						variant="contained">Подтвердить</Button>
			</ConfirmDialog>
			
		</>
	)
};

const UserTable: FC<IUserTableProps> = (props) => {
	const classes = useStyles();
	const {users, page, total, onChangePage, size, role} = props;
	const count = Math.ceil(total / size) || 1;
	return (
		<div>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell align="center">Создан</TableCell>
							<TableCell align="center" className={classes.actionColumn}> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users && users.map((user) => {
							return (
								<UserRow
									key={user.ID}
									user={user}
									role={role}
								/>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>
			
			{total > size && <>
				<Pagination count={count}
							page={page + 1}
							hidePrevButton
							hideNextButton
							onChange={(e, i) => onChangePage(e, i)}
				/>
			</>}
			
		</div>
	)
};

export default UserTable;