import React, {FC, FormEvent, useRef, useState} from "react";
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
	DialogTitle,
	Typography
} from "@material-ui/core";
import {Add} from "@material-ui/icons";

interface IFileUploadDialogProps {
	text: string,
	open: boolean,
	onClose: () => void
}

//const kbSize = /mac/ig.test(navigator.appVersion || '') ? 1000 : 1024;
const kbSize = 1000;
const maxSizeMB = 1000 * 1000 * 500;
const mimeTypes: string[] = ["video/mpeg","video/mp4","video/quicktime", "image/png", "image/jpg", "image/jpeg"];
const accept: string = ".mpeg,.mp4,.mov,.png,.jpg,.jpeg";

const FileUploadDialog: FC<IFileUploadDialogProps> = ({text, open, onClose}) => {
	const dispatch = useDispatch();
	const [result, setResult] = useState<boolean | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [file, setFile] = useState<File | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	
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
			dispatch(popup_snack("Ошибка: расширение файла не поддерживается"));
			resetFile();
			return;
		}
		if (!isSizeValid(file)) {
			dispatch(popup_snack("Ошибка: файл слишком большой"));
			resetFile();
			return;
		}
		setFile(e.currentTarget.files[0]);
	};
	
	const isMimeTypeValid = (file: File): boolean => {
		return mimeTypes.includes(file.type);
	};
	
	const isSizeValid = (file: File): boolean => {
		return file.size < maxSizeMB;
	};
	
	const resetFile = (): void => {
		setFile(null);
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
						{!uploading ? text : progress < 100 ? "Идет загрузка..." : "Подождите, файл обрабатывается"}
					</DialogContentText>
					{uploading ?
						<LinearProgressWithLabel value={progress}/>
						:
						<>
							<input type="file" onChange={onFileChange} ref={fileRef} accept={accept}/>
							<br/>
							{file && <>
								<Typography>
									<strong>Размер</strong>: {file.size > 0 ? Number(file.size / kbSize / kbSize).toFixed(3) : 0} MB<br />
								</Typography>
							</>}
						</>
					}
				</form>}
				{result === false && <Alert severity="error">Не удалось загрузить файл</Alert>}
				{result === true && <Alert severity="success">Файл был успешно загружен</Alert>}
			</DialogContent>
			<DialogActions>
				<Button type="button" color="default" disabled={uploading} onClick={() => {
					onClose();
					setTimeout(() => setResult(null), 1000);
				}}>Закрыть</Button>&nbsp;
				
				{result === null && <Button
					type="button"
					disabled={uploading || !file}
					onClick={onSubmit}
					variant="contained"
					color="primary">Загрузить</Button>
				}
			</DialogActions>
		</Dialog>
	);
};

const AssetsPage: FC = () => {
	const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
	
	const uploadButton = <Button
		variant="contained"
		color="primary"
		startIcon={<Add/>}
		onClick={() => setUploadDialogOpen(true)}>Загрузить файл</Button>;
	
	return (
		<PageWrapper heading="Ресурсы" actionArea={uploadButton}>
			
			<FileUploadDialog
				text={"Выберите файл с видео/изображением для загрузки."}
				open={uploadDialogOpen}
				onClose={() => setUploadDialogOpen(false)}
			/>
			
		</PageWrapper>
	);
};

export default AssetsPage;