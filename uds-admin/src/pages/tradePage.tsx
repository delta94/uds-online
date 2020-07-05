import React, {FC, FormEvent, useEffect, useRef, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl, InputLabel, MenuItem,
	Select,
	TextField
} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {PaperComponent} from "../components/confirmDialog";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IUser} from "../reducers/usersReducer";
import {ICourse} from "../reducers/courseReducer";
import {useDispatch, useSelector} from "react-redux";
import {create_purchase, get_courses, get_users_plain, popup_snack} from "../actions";
import {IReducerState} from "../reducers";
import {ROLES} from "../constants";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		spacer: {
			height: 20,
		},
	})
);

interface AddPurchaseDialogProps {
	open: boolean,
	onClose: () => void
}

const MAX_SUM = 9000;

const AddPurchaseDialog: FC<AddPurchaseDialogProps> = ({open, onClose}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const formRef = useRef<HTMLFormElement>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [accountID, setAccountID] = useState<string>("");
	const [courseID, setCourseID] = useState<string>("");
	const [accounts, setAccounts] = useState<IUser[]>([]);
	const courseState = useSelector((state: IReducerState) => state.course);
	const [sum, setSum] = useState<number>(0);
	const [order, setOrder] = useState<number>(0);
	
	
	useEffect(() => {
		setAccountID("");
		setCourseID("");
		setSum(0);
		setOrder(0);
	}, [open]);
	
	useEffect(() => {
		dispatch(get_courses());
		dispatch(get_users_plain((accounts => {
			setAccounts(accounts);
		})))
	}, []);
	
	const onSubmit = (e: FormEvent) => {
		if (!isFormValid()) {
			e.preventDefault();
			return;
		}
		dispatch(create_purchase(Number(courseID), accountID, sum, order, () => {
			onClose();
			dispatch(popup_snack("Запись успешно создана"))
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
										{a.email} &bull; [ ID: {a.ID} ]
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
				<Button type="button" color="default" onClick={() => onClose()}>Закрыть</Button>&nbsp;
				<Button type="button" color="primary" variant="contained" disabled={!isFormValid() || loading}
						onClick={onSubmit}>Подтведить</Button>
			</DialogActions>
		</Dialog>
	)
};

const TradePage: FC = () => {
	const [open, setOpen] = useState<boolean>(false);
	
	const addButton = <Button
		variant="contained"
		color="primary"
		startIcon={<Add/>}
		onClick={() => setOpen(true)}>Добавить</Button>;
	
	return (
		<PageWrapper heading="Продажи" actionArea={addButton}>
			
			<AddPurchaseDialog open={open} onClose={() => setOpen(false)}/>
		
		
		</PageWrapper>
	);
};

export default TradePage;