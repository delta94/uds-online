import React, {FC, useEffect, useState} from "react";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Button
} from "@material-ui/core";
import Moment from "moment";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IPagination} from "../helpers/models";
import {Pagination} from "@material-ui/lab";
import {useTranslation} from "react-i18next";
import {Delete} from "@material-ui/icons";
import {ConfirmDialog} from "./confirmDialog";
import {useDispatch, useSelector} from "react-redux";
import {delete_purchase, get_purchases, popup_snack} from "../actions";
import {IPurchase} from "../reducers/tradeReducer";
import {IReducerState} from "../reducers";
import {ICourse} from "../reducers/courseReducer";
import {IUser} from "../reducers/usersReducer";

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
		actionColumn: {
			width: '55px'
		}
	})
);

interface ITradeRowProps {
	accounts: IUser[],
	purchase: IPurchase,
	courses: ICourse[]
}

const TradeRow: FC<ITradeRowProps> = ({accounts, courses, purchase}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const {ID, account_id, order, sum, course_id, CreatedAt} = purchase;
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const created = Moment(CreatedAt).format("DD-MM-YYYY HH:mm");
	
	const handleDelete = (id: string) => {
		dispatch(delete_purchase(id, (result) => {
			if (result) {
				dispatch(popup_snack("Запись успешно удалена"));
				dispatch(get_purchases());
			}
		}));
	};
	
	const getTitle = (id: number): string => {
		let t = '';
		for (let i = 0; i < courses.length; i++) {
			if (courses[i].ID && courses[i].ID === id) {
				t = courses[i].title;
				break;
			}
		}
		return t;
	};
	
	const getAccountInfo = (id: string): JSX.Element => {
		let html = <></>;
		for (let i = 0; i < accounts.length; i++) {
			const a = accounts[i];
			if (a.ID && a.ID === id) {
				html = <>
					{a.name} ({a.email})<br/>
					<small>{a.ID}</small>
				</>;
				break;
			}
		}
		return html;
	};
	
	return (
		<>
			<TableRow>
				<TableCell component="th" scope="row">
					{getAccountInfo(account_id)}
				</TableCell>
				<TableCell align="center">
					{getTitle(course_id)}
				</TableCell>
				<TableCell align="center">
					{created}
				</TableCell>
				<TableCell align="center">
					{order ? order : '-'}
				</TableCell>
				<TableCell align="center">
					{sum}
				</TableCell>
				<TableCell align="right" className={classes.actionColumn}>
					<IconButton onClick={() => setDeleteDialogOpen(true)}>
						<Delete />
					</IconButton>
				</TableCell>
			</TableRow>
			
			<ConfirmDialog
				heading={t('PAGE_PURCHASES.DELETE_DIALOG_TITLE')}
				open={deleteDialogOpen}
				text={t('PAGE_PURCHASES.DELETE_DIALOG_TEXT')}>
				
				<Button onClick={() => setDeleteDialogOpen(false)}>{t('BUTTONS.CANCEL')}</Button>
				
				<Button onClick={() => handleDelete(ID!)}
						color="primary"
						variant="contained">{t('BUTTONS.CONFIRM')}</Button>
			</ConfirmDialog>
		</>
	);
};

interface IUploadTableProps extends IPagination {
	accounts: IUser[],
	purchases: IPurchase[];
	onChangePage: (v: number) => void;
}

const UploadTable: FC<IUploadTableProps> = (props) => {
	const classes = useStyles();
	const [t] = useTranslation();
	const {purchases, page, total, onChangePage, size, accounts} = props;
	const courseState = useSelector((state: IReducerState) => state.course);
	const count = Math.ceil(total / size) || 1;
	useEffect(() => {
		if (!purchases.length && page > 0) {
			onChangePage(page - 1);
		}
	}, [purchases]);
	return (
		<>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>{t('PAGE_PURCHASES.ACCOUNT')}</TableCell>
							<TableCell align="center">{t('PAGE_PURCHASES.COURSE_TITLE')}</TableCell>
							<TableCell align="center">{t('PAGE_PURCHASES.PURCHASED')}</TableCell>
							<TableCell align="center">{t('PAGE_PURCHASES.ORDER')}</TableCell>
							<TableCell align="center">{t('PAGE_PURCHASES.SUM')}</TableCell>
							
							<TableCell align="right" className={classes.actionColumn} />
						</TableRow>
					</TableHead>
					<TableBody>
						{purchases && purchases.map((purchase) => {
							return (
								<TradeRow
									key={purchase.ID}
									purchase={purchase}
									accounts={accounts}
									courses={courseState.items || []}
									
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
							onChange={(e, i) => onChangePage(i)}
				/>
			</>}
		
		</>
	);
};

export default UploadTable;
