import React, {FC, FormEvent, useEffect, useRef, useState} from "react";
import {PageWrapper} from "../components/pageWrapper";
import axios from "axios";
import {PaperComponent} from "../components/confirmDialog";
import {Alert} from "@material-ui/lab";
import {LinearProgressWithLabel} from "../components/linearProgressWithLabel";
import {popup_snack} from "../actions";
import {useDispatch} from "react-redux";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle, FormControl, TextField,
	Typography
} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {useTranslation} from "react-i18next";

interface IFileUploadDialogProps {
	text: string,
	open: boolean,
	onClose: () => void
}

//const kbSize = /mac/ig.test(navigator.appVersion || '') ? 1000 : 1024;
const kbSize = 1000;
const maxSizeMB = 500;
const maxSize = 1000 * 1000 * maxSizeMB;
const mimeTypes: string[] = ["video/mpeg","video/mp4","video/quicktime", "image/png", "image/jpg", "image/jpeg", "audio/mpeg", "audio/wav"];
const accept: string = ".mpeg,.mp4,.mov,.png,.jpg,.jpeg,.mp3,.wav";
const MAX_LENGTH_COMMENT = 80;

const FileUploadDialog: FC<IFileUploadDialogProps> = ({text, open, onClose}) => {
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const [result, setResult] = useState<boolean | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [file, setFile] = useState<File | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const [comment, setComment] = useState<string>("");
	
	useEffect(() => {
		if (!open) {
			return;
		}
		setResult(null);
		resetFile();
	}, [open]);
	
	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!file) {
			return;
		}
		if (!isSizeValid(file)) {
			return;
		}
		if (!isMimeTypeValid(file)) {
			return;
		}
		setUploading(true);
		
		const url = `/v1/uploads`;
		const formData = new FormData();
		formData.append('file', file);
		formData.append('comment', comment);
		axios.post(url, formData, {
			onUploadProgress: progressEvent => setProgress(Math.ceil(100 * progressEvent.loaded / progressEvent.total)),
		})
			.then(() => {
				setResult(true);
			})
			.catch(() => {
				setResult(false);
			})
			.finally(() => {
				setUploading(false);
				setProgress(0);
				resetFile();
			});
	};
	
	const onFileChange = (e: React.FormEvent<HTMLInputElement>) => {
		if (!e.currentTarget.files || !e.currentTarget.files[0]) {
			resetFile();
			return;
		}
		const file: File = e.currentTarget.files[0];
		if (!isMimeTypeValid(file)) {
			dispatch(popup_snack(t('MESSAGES.WRONG_EXTENSION')));
			resetFile();
			return;
		}
		if (!isSizeValid(file)) {
			dispatch(popup_snack(t('MESSAGES.TOO_LARGE_FILE')));
			resetFile();
			return;
		}
		setFile(e.currentTarget.files[0]);
	};
	
	const isMimeTypeValid = (file: File): boolean => {
		return mimeTypes.includes(file.type);
	};
	
	const isSizeValid = (file: File): boolean => {
		return file.size < maxSize;
	};
	
	const resetFile = (): void => {
		setFile(null);
		setComment("");
		if (fileRef.current !== null) {
			fileRef.current.value = '';
		}
	};
	
	return (
		<Dialog
			fullWidth
			open={open}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
				Загрузка файла
			</DialogTitle>
			<DialogContent>
				{result === null &&	<form onSubmit={onSubmit}>
					<DialogContentText>
						{!uploading ? text : progress < 100 ? t('PAGE_ASSETS.LOADING') : t('PAGE_ASSETS.PROCESSING_FILE')}
					</DialogContentText>
					{uploading ?
						<LinearProgressWithLabel value={progress}/>
						:
						<>
							<input type="file" onChange={onFileChange} ref={fileRef} accept={accept}/>
							<br/>
							<br/>
							{file && <>
								<Typography>
									<strong>{t('COMMON.SIZE')}</strong>: {file.size > 0 ? Number(file.size / kbSize / kbSize).toFixed(2) : 0} / {maxSizeMB} MB<br />
								</Typography>
								<FormControl fullWidth>
									<TextField
										autoComplete="off"
										id="input-comment"
										value={comment}
										label={t('COMMON.COMMENT')}
										helperText={t('PAGE_ASSETS.COMMENT_CHARACTERS_LEFT', {ratio: `${comment.length}/${MAX_LENGTH_COMMENT}`})}
										fullWidth
										inputProps={{
											maxLength: MAX_LENGTH_COMMENT
										}}
										onChange={(e) => setComment(e.target.value)}
									/>
								</FormControl>
							</>}
						</>
					}
				</form>}
				{result === false && <Alert severity="error">{t('MESSAGES.FILE_UPLOAD_FAILED')}</Alert>}
				{result === true && <Alert severity="success">{t('MESSAGES.FILE_UPLOAD_SUCCESSFUL')}</Alert>}
			</DialogContent>
			<DialogActions>
				<Button type="button" color="default" disabled={uploading} onClick={onClose}>{t('BUTTONS.CLOSE')}</Button>&nbsp;
				
				{result === null && <Button
					type="button"
					disabled={uploading || !file}
					onClick={onSubmit}
					variant="contained"
					color="primary">{t('BUTTONS.UPLOAD')}</Button>
				}
			</DialogActions>
		</Dialog>
	);
};

const AssetsPage: FC = () => {
	const [t] = useTranslation();
	const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
	
	const uploadButton = <Button
		variant="contained"
		color="primary"
		startIcon={<Add/>}
		onClick={() => setUploadDialogOpen(true)}>{t('PAGE_ASSETS.UPLOAD_BUTTON')}</Button>;
	
	return (
		<PageWrapper heading={t('TITLES.ASSETS')} actionArea={uploadButton}>
			
			<FileUploadDialog
				text={t('PAGE_ASSETS.UPLOAD_DIALOG_TEXT')}
				open={uploadDialogOpen}
				onClose={() => setUploadDialogOpen(false)}
			/>
			
		</PageWrapper>
	);
};

export default AssetsPage;