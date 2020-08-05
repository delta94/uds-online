import React, {FC, useEffect, useRef, useState} from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Slider,
} from "@material-ui/core";
import Cropper from 'react-easy-crop'
import {PaperComponent} from "./confirmDialog";
import {Area, Point} from "react-easy-crop/types";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {popup_snack} from "../actions";
import {convertFile2Base64} from "../helpers";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import "react-easy-crop/react-easy-crop.css";


const PREVIEW_WIDTH = 350;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			width: PREVIEW_WIDTH * 3,
			maxWidth: '100%',
			minHeight: PREVIEW_WIDTH / RATIO,
		},
		uploadArea: {
			margin: 'auto',
			width: '100%',
			height: 300,
			display: 'flex',
			padding: 10,
			border: '1px dashed #CECECE',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'relative'
		},
		editor: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'flex-start'
		},
		cropperCell: {
			width: '70%',
			marginRight: 10
		},
		cropperContainer: {
			position: 'relative',
			minHeight: PREVIEW_WIDTH / RATIO,
			marginBottom: 10
		},
		resultCell: {
			flexShrink: 0
		},
		grow: {
			flexGrow: 1
		}
	})
);
interface IPictureCropDialog {
	open: boolean,
	onSave: (img_base64: string) => void,
	onClose: () => void
}

const RATIO = 16 / 9;
const mimeTypes: string[] = ["image/png", "image/jpg", "image/jpeg"];
const accept: string = ".png,.jpg,.jpeg";

const maxSizeMB = 5;
const maxSize = 1000 * 1000 * maxSizeMB;

const PictureCropDialog: FC<IPictureCropDialog> = ({open, onClose, onSave}) => {
	const [image, setImage] = useState<string>("");
	const [zoom, setZoom] = useState<number>(1);
	
	const [crop, setCrop] = useState<Point>({x: 0, y: 0});
	const [result, setResult] = useState<string>("");

	const classes = useStyles();
	const fileRef = useRef<HTMLInputElement>(null);
	const dispatch = useDispatch();
	const [t] = useTranslation();
	
	useEffect(() => {
		if (open) {
			setImage('');
			setResult('');
			setZoom(1);
			setCrop({x: 0, y: 0});
		}
	}, [open])
	
	const isMimeTypeValid = (file: File): boolean => {
		return mimeTypes.includes(file.type);
	};

	const isSizeValid = (file: File): boolean => {
		return file.size < maxSize;
	};

	const resetImage = (): void => {
		
		if (fileRef.current !== null) {
			fileRef.current.value = '';
		}
	};
	
	const onFileChange = async (e: React.FormEvent<HTMLInputElement>) => {
		if (!e.currentTarget.files || !e.currentTarget.files[0]) {
			resetImage();
			return;
		}
		const file: File = e.currentTarget.files[0];
		if (!isMimeTypeValid(file)) {
			dispatch(popup_snack(t('MESSAGES.WRONG_EXTENSION')));
			resetImage();
			return;
		}
		if (!isSizeValid(file)) {
			dispatch(popup_snack(t('MESSAGES.TOO_LARGE_FILE')));
			resetImage();
			return;
		}
		const imgBase64: string | Error = await convertFile2Base64(file).catch(e => new Error(e));
		if (imgBase64 instanceof Error) {
			dispatch(popup_snack(
			//	t('MESSAGES.TOO_LARGE_FILE')
				"Cannot use this image"
			));
			resetImage();
			return;
		}
		setImage(imgBase64);
		//setFile(e.currentTarget.files[0]);
	};
	const onCropChange = (crop: Point) => {
		setCrop(crop);
		console.log(crop);
	}
	
	const onCropComplete = async (croppedArea: Area, croppedAreaPixels: Area) => {
		// console.log(croppedArea, croppedAreaPixels)
		console.log(image);
		if (!image) {
			return;
		}
		const result = await getCroppedImg(image, croppedAreaPixels, PREVIEW_WIDTH, PREVIEW_WIDTH / RATIO);
		setResult(result);
	}
	
	const onZoomChange = (zoom: number) => {
		setZoom(zoom);
	}
	
	return (
		<Dialog
			fullWidth
			open={open}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
				{t('PAGE_COURSES.PICTURE_DIALOG_TITLE')}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{t('PAGE_COURSES.PICTURE_DIALOG_TEXT')}
				</DialogContentText>
				
				<div className={classes.wrap}>
				
				{!image && <div className={classes.uploadArea}>
					<input type="file"
						   onChange={onFileChange}
						   accept={accept}
					/>
				</div>}
				
				{image && <div className={classes.editor}>
					<div className={classes.cropperCell}>
						<div className={classes.cropperContainer}>
							<Cropper
								image={image}
								crop={crop}
								zoom={zoom}
								aspect={RATIO}
								onCropChange={onCropChange}
								onCropComplete={onCropComplete}
								onZoomChange={onZoomChange}
							/>
						</div>
						<Slider
							value={zoom}
							min={1}
							max={3}
							step={0.1}
							aria-labelledby="Zoom"
							onChange={(e, zoom) => setZoom(zoom as number)}
							//classes={{ container: 'slider' }}
						/>
					</div>
					
					<div className={classes.resultCell}>
						{result && <img src={result} width={PREVIEW_WIDTH} height={PREVIEW_WIDTH / RATIO} alt=""/>}
					</div>
				</div>}
				
				</div>
			</DialogContent>
			<DialogActions>
				{image && <>
					<Button variant='contained' color='default' onClick={() => {
						setResult('');
						setImage('');
					}}>{t('BUTTONS.RESET')}</Button>
					
					<div className={classes.grow} />
				</>}
				<Button onClick={() => onClose()}>{t('BUTTONS.CLOSE')}</Button>
				<Button
					onClick={() => onSave(result)}
					disabled={!result}
					color='primary'
					variant='contained'
				>{t('BUTTONS.CONFIRM')}</Button>
			</DialogActions>
		</Dialog>
	);
};

const createImage = (url: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', error => reject(error));
		image.src = url;
	})

/**
 *
 * @param imageSrc
 * @param pixelCrop
 * @param width
 * @param height
 */
export async function getCroppedImg(imageSrc: string, pixelCrop: Area, width: number, height: number): Promise<string> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	
	const maxSize = Math.max(image.width, image.height)
	const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))
	
	canvas.width = safeArea;
	canvas.height = safeArea;
	
	// translate canvas context to a central location on image to allow rotating around the center.
	if (!ctx) {
		return Promise.reject("No context");
	}
	
	ctx.translate(safeArea / 2, safeArea / 2);
	ctx.translate(-safeArea / 2, -safeArea / 2);
	
	ctx.drawImage(
		image,
		safeArea / 2 - image.width * 0.5,
		safeArea / 2 - image.height * 0.5
	);
	const data: ImageData = ctx.getImageData(0, 0, safeArea, safeArea);
	
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;
	
	try {
		ctx.putImageData(
			data,
			Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
			Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
		);
	} catch (e) {
		console.log("Error!", e);
	}
	const croppedImage = await createImage(canvas.toDataURL('image/jpeg'));
	const sCanvas = document.createElement('canvas');
	const sCtx = sCanvas.getContext('2d')!;
	sCanvas.setAttribute('width', width + 'px');
	sCanvas.setAttribute('height', height + 'px');
	
	sCtx.drawImage(croppedImage, 0, 0, width, height);
	const sData = sCtx.getImageData(0, 0, width, height);
	sCtx.putImageData(sData, 0, 0);
	// As Base64 string
	// return sCanvas.toDataURL('image/jpeg');
	return new Promise<string>(resolve => {
		sCanvas.toBlob(file => {
			resolve(URL.createObjectURL(file))
		}, 'image/jpeg')
	})
}



export default PictureCropDialog;