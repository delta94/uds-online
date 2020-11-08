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
	Typography, Popover, ClickAwayListener, Button
} from "@material-ui/core";
import {IUpload} from "../reducers/uploadReducer";
import Moment from "moment";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IPagination} from "../helpers/models";
import {Pagination} from "@material-ui/lab";
import {useTranslation} from "react-i18next";
import {Delete, FileCopy, Info} from "@material-ui/icons";
import {ConfirmDialog} from "./confirmDialog";
import {useDispatch} from "react-redux";
import {delete_upload, get_uploads, popup_snack} from "../actions";

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
		},
		comment: {
			display: 'inline-block',
			minWidth: 50
		},
		popover: {
			pointerEvents: 'none',
		},
		paper: {
			padding: theme.spacing(1),
		},
	})
);

interface IUploadRowProps {
	upload: IUpload
}

const UploadRow: FC<IUploadRowProps> = ({upload: {alias, ID, original_name, CreatedAt, comment, type}}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [showComment, setShowComment] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const created = Moment(CreatedAt).format("DD-MM-YYYY HH:mm");
	
	const onClickComment = (e: React.SyntheticEvent | React.MouseEvent) => {
		setShowComment(true);
		setAnchorEl(e.currentTarget);
	};
	const handleClickAway = () => {
		setShowComment(false);
		setAnchorEl(null);
	};
	
	const handleDelete = () => {
		dispatch(delete_upload(ID!, (result) => {
			if (result) {
				dispatch(get_uploads());
				dispatch(popup_snack(t('MESSAGES.FILE_DELETED_SUCCESSFUL')))
			}
			setDeleteDialogOpen(false);
		}));
	};
	
	const copyAlias = () => {
		const textField = document.createElement('textarea');
		textField.innerText = alias;
		document.body.appendChild(textField);
		textField.select();
		document.execCommand('copy');
		textField.remove();
		dispatch(popup_snack(t("MESSAGES.ALIAS_COPIED", {alias})));
	};
	
	return (
		<>
			<TableRow>
				<TableCell component="th" scope="row">
					{alias}
					<IconButton size="small" onClick={copyAlias}>
						<FileCopy fontSize="small"/>
					</IconButton>
				</TableCell>
				<TableCell align="center">
					{created}
				</TableCell>
				<TableCell align="center">
					{original_name}
				</TableCell>
				<TableCell align="center">
					{type}
				</TableCell>
				<TableCell align="center">
					{comment && comment.trim().length > 0 && <>
						<ClickAwayListener onClickAway={handleClickAway}>
							<IconButton onClick={onClickComment}>
								<Info/>
							</IconButton>
						</ClickAwayListener>
						
						<Popover
							id={'comm-'+ ID}
							open={showComment}
							anchorEl={anchorEl}
							className={classes.popover}
							classes={{
								paper: classes.paper,
							}}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'center',
							}}
						>
							<Typography>
								{comment}
							</Typography>
						</Popover>
					</>}
				</TableCell>
				<TableCell align="right">
					<IconButton onClick={() => setDeleteDialogOpen(true)}>
						<Delete />
					</IconButton>
				</TableCell>
			</TableRow>
			
			<ConfirmDialog
				heading={t('PAGE_ASSETS.DELETE_DIALOG_TITLE')}
				open={deleteDialogOpen}
				text={t('PAGE_ASSETS.DELETE_DIALOG_TEXT')}>
				
				<Button onClick={() => setDeleteDialogOpen(false)}>{t('BUTTONS.CANCEL')}</Button>
				
				<Button onClick={handleDelete}
						color="primary"
						variant="contained">{t('BUTTONS.CONFIRM')}</Button>
			</ConfirmDialog>
		</>
	);
};

interface IUploadTableProps extends IPagination {
	uploads: IUpload[];
	onChangePage: (v: number) => void;
}

const UploadTable: FC<IUploadTableProps> = (props) => {
	const classes = useStyles();
	const [t] = useTranslation();
	const {uploads, page, total, onChangePage, size} = props;
	const count = Math.ceil(total / size) || 1;
	useEffect(() => {
		if (!uploads.length && page > 0) {
			onChangePage(page - 1);
		}
	}, [uploads]);
	return (
		<div>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Alias</TableCell>
							<TableCell align="center">{t('COMMON.CREATED_AT')}</TableCell>
							<TableCell align="center">{t('PAGE_ASSETS.ORIGINAL_NAME')}</TableCell>
							<TableCell align="center">{t('COMMON.TYPE')}</TableCell>
							<TableCell align="center">{t('COMMON.COMMENT')}</TableCell>
							<TableCell align="right" className={classes.actionColumn}> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{uploads && uploads.map((upload) => {
							return (
								<UploadRow
									key={upload.ID}
									upload={upload}
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
		
		</div>
	);
};

export default UploadTable;
