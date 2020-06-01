import React, {FC, useState} from 'react';
import {
	Button,
	Chip,
	IconButton, Menu, MenuItem,
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


const ITEM_HEIGHT = 48;
const MSG_BLOCK_USER_TEXT = "Данный пользователь будет заблокирован. Он не сможет войти в систему до тех пор, пока вы не восстановите ему доступ. Продолжить?";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		table: {
			minWidth: 650,
		},
		tableContainer: {
			marginBottom: 20,
		},
		btnBLock: {
			color: 'red',
		},
		btnUnbLock: {},
	}),
);


interface IUserTableProps extends IPagination {
	users: IUser[],
	onChangePage: Function,
}

interface IUserRowProps {
	user: IUser,
}

const UserRow: FC<IUserRowProps> = ({user}) => {
	const classes = useStyles();
	const [selectedUserID, setUserID] = useState<string | null>("");
	// for menu
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const [blockModalOpen, setBlockModal] = useState<boolean>(false);
	const [unblockModalOpen, setUnblockModal] = useState<boolean>(false);
	
	const onModalClose = () => {
		setUserID(null);
		setBlockModal(false);
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
	
	const handleBlockUser = () => {
		if (selectedUserID) {
			// block user
		}
		onModalClose();
	};
	
	const onUnblockClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
		handleMenuClose();
		setUserID(id);
		if (selectedUserID) {
			// unblock user
		}
		onModalClose();
	};
	const created = Moment(user.CreatedAt).format("DD-MM-YYYY HH:mm");
	return (
		<>
			<TableRow key={user.ID}>
				<TableCell component="th" scope="row">
					{user.email}&nbsp;
					{!user.confirmed && <Chip label="Не подтвержден" size="small"/>}
				</TableCell>
				<TableCell align="right">{created}</TableCell>
				<TableCell align="right">{user.is_blocked ? 'Да' : 'Нет'}</TableCell>
				<TableCell align="right">
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
								maxHeight: ITEM_HEIGHT * 4.5,
								// width: '20ch',
							},
						}}
					>
						<MenuItem disabled={user.confirmed}>
							<Done fontSize="small"/>&nbsp;Подтвердить Email
						</MenuItem>
						{user.is_blocked && <MenuItem
							className={classes.btnUnbLock}
							onClick={(e) => onUnblockClick(e, user.ID)}>
							Разблокировать
						</MenuItem>}
						
						{!user.is_blocked && <MenuItem
							className={classes.btnBLock}
							onClick={(e) => onBlockClick(e, user.ID)}>
							<NotInterested fontSize="small"/>&nbsp;Заблокировать
						</MenuItem>}
					</Menu>
				</TableCell>
			</TableRow>
			
			<ConfirmDialog
				heading="Блокировка пользователя"
				open={blockModalOpen}
				text={MSG_BLOCK_USER_TEXT}>
				
				<Button onClick={onModalClose}>Отмена</Button>
				
				<Button onClick={handleBlockUser}
						color="primary"
						variant="contained">Подтвердить</Button>
			</ConfirmDialog>
			
		</>
	)
};

const UserTable: FC<IUserTableProps> = (props) => {
	const classes = useStyles();
	const {users, page, total, onChangePage, size} = props;
	const count = Math.ceil(total / size);
	return (
		<div>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell align="right">Создан</TableCell>
							<TableCell align="right">Заблокрован</TableCell>
							<TableCell align="right"> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users && users.map((user) => {
							return (
								<UserRow
									key={user.ID}
									user={user}
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