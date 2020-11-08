import React, {FC, FormEvent, lazy, Suspense, useEffect, useRef, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {PaperComponent} from "../components/confirmDialog";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IUser} from "../reducers/usersReducer";
import {useDispatch, useSelector} from "react-redux";
import {create_purchase, get_courses, get_purchases, get_users_plain, popup_snack} from "../actions";
import {IReducerState} from "../reducers";
import {ComponentSpinner} from "../components/spinner";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
	})
);

interface AddPurchaseDialogProps {
	accounts: IUser[],
	open: boolean,
	onClose: () => void
}

const MAX_SUM = 99999;

const AddPurchaseDialog: FC<AddPurchaseDialogProps> = ({accounts, open, onClose}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const formRef = useRef<HTMLFormElement>(null);
	const [loading] = useState<boolean>(false);
	const [accountID, setAccountID] = useState<string>("");
	const [courseID, setCourseID] = useState<string>("");
	const courseState = useSelector((state: IReducerState) => state.course);
	const [sum, setSum] = useState<number>(0);
	const [order, setOrder] = useState<number>(0);
	const [t] = useTranslation();
	
	useEffect(() => {
		setAccountID("");
		setCourseID("");
		setSum(0);
		setOrder(0);
	}, [open]);
	
	const onSubmit = (e: FormEvent) => {
		if (!isFormValid()) {
			e.preventDefault();
			return;
		}
		dispatch(create_purchase(Number(courseID), accountID, sum, order, () => {
			onClose();
			dispatch(popup_snack("Запись успешно создана"));
			dispatch(get_purchases());
		}));
	};
	
	const isFormValid = (): boolean => {
		let isOK = true;
		if (sum <= 0 || sum > MAX_SUM) {
			isOK = false;
		}
		if (sum < 0) {
			isOK = false;
		}
		if (accountID === "" || courseID === "") {
			isOK = false;
		}
		return isOK;
	};
	
	return (
		<Dialog
			fullWidth
			open={open}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
				Добавить покупку
			</DialogTitle>
			<DialogContent>
				<form ref={formRef} onSubmit={onSubmit}>
					<FormControl fullWidth>
						<InputLabel id="select-account">Учетная запись</InputLabel>
						<Select
							required
							fullWidth
							labelId="select-account"
							onChange={({target}) => setAccountID(String(target.value))}
							value={accountID}>
							{accounts && accounts.map((a) => {
								return (
									<MenuItem key={a.ID} value={a.ID}>
										{a.name}, {a.email} &bull; [ ID: {a.ID} ]
									</MenuItem>
								)
							})}
						</Select>
					</FormControl>
					
					<div className={classes.spacer}/>
					
					<FormControl fullWidth>
						<InputLabel id="select-course">Курс</InputLabel>
						<Select
							required
							fullWidth
							labelId="select-course"
							onChange={({target}) => setCourseID(String(target.value))}
							value={courseID}>
							{courseState.items && courseState.items.map((c) => {
								let title = c.title;
								if (title.length > 40) {
									title = title.substr(0, 40) + "...";
								}
								return (
									<MenuItem key={c.ID} value={c.ID}>
										{title} &bull; [ ID: {c.ID} ]
									</MenuItem>
								)
							})}
						</Select>
					</FormControl>
					
					<div className={classes.spacer}/>
					
					<FormControl fullWidth>
						<TextField
							id="input-sum"
							type="number"
							value={sum}
							label="Сумма, руб."
							helperText={`Максимальная сумма - ${MAX_SUM} рублей.`}
							fullWidth
							required
							inputProps={{
								min: 0,
								max: MAX_SUM,
							}}
							onChange={(e) => setSum(Number(e.target.value))}
						/>
					</FormControl>
					
					<div className={classes.spacer}/>
					
					<FormControl fullWidth>
						<TextField
							id="input-order"
							type="number"
							value={order}
							label="Номер заказа"
							helperText={`Если номера заказа нет - введите 0`}
							fullWidth
							inputProps={{
								min: 0
							}}
							onChange={(e) => setOrder(Number(e.target.value))}
						/>
					</FormControl>
				
				</form>
			</DialogContent>
			<DialogActions>
				<Button type="button" color="default" onClick={() => onClose()}>{t('BUTTONS.CLOSE')}</Button>&nbsp;
				<Button type="button" color="primary" variant="contained" disabled={!isFormValid() || loading}
						onClick={onSubmit}>{t('BUTTONS.CONFIRM')}</Button>
			</DialogActions>
		</Dialog>
	)
};

const TradeTable = lazy(() => import('../components/tradeTable'));

const TradePage: FC = () => {
	const [t] = useTranslation();
	const [open, setOpen] = useState<boolean>(false);
	const [accounts, setAccounts] = useState<IUser[]>([]);
	const dispatch = useDispatch();
	const purchaseState = useSelector((state: IReducerState) => state.purchases);
	
	useEffect(() => {
		dispatch(get_purchases());
		dispatch(get_courses());
		dispatch(get_users_plain((accounts => {
			setAccounts(accounts);
		})))
	}, []);
	
	
	const handlePageChange = (value: number) => {
		dispatch(get_purchases(value - 1));
	}
	
	const addButton = <Button
		variant="contained"
		color="primary"
		startIcon={<Add/>}
		onClick={() => setOpen(true)}>{t('BUTTONS.ADD')}</Button>;
	
	return (
		<PageWrapper heading={t('TITLES.SALES')} actionArea={addButton}>
			
			<Suspense fallback={<ComponentSpinner/>}>
				<TradeTable
					accounts={accounts}
					purchases={purchaseState.data}
					page={purchaseState.page}
					total={purchaseState.total}
					size={purchaseState.size}
					onChangePage={
						(v: number) => handlePageChange(v)
					}
				/>
			</Suspense>
			
			<AddPurchaseDialog accounts={accounts} open={open}  onClose={() => setOpen(false)}/>
		</PageWrapper>
	);
};

export default TradePage;
