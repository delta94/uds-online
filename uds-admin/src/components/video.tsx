import React, {FC, useRef, useState} from "react";
import ReactPlayer from 'react-player';
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

interface IVideoProps {
	src: string
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			margin: '1rem 0',
		},
		video: {
			maxHeight: '300px',
			backgroundColor: '#000000',
			width: '100%',
			outline: 'none'
		},
		controls: {
			display: 'flex'
		},
		playbackBtn: {
			width: '20px',
		}
	}),
);

export const Video: FC<IVideoProps> = ({src}) => {
	const classes = useStyles();
	const [playing, setPlaying] = useState(false);
	const ref = useRef(null);
	const handleClick = (event: React.SyntheticEvent | React.MouseEvent) => {
		console.log({event});
		if (event.type === "contextmenu") {
			event.preventDefault();
			return false;
		}
	};
	
	return (
		<div className={classes.wrap}>
			{/*<video onClick={handleClick} onContextMenu={handleClick} className={classes.video} src={process.env.REACT_APP_S3_VIDEO_ROOT + '/' + src} controls>*/}
			{/*	<source/>*/}
			{/*</video>*/}
			<ReactPlayer ref={ref}
						 onContextMenu={handleClick}
						 playing={playing}
						 controls={true}
						 onProgress={(data: any) => {console.log({data})}}
						 url={src}
			/>
			<div className={classes.controls}>
				<button className={classes.playbackBtn} onClick={() => setPlaying(!playing)}>
					{playing ? 'Пауза': 'Пуск'}
				</button>
				
				{/*<button onClick={() => {(ref.current).getInternalPlayer('webkitEnterFullScreen')}}>*/}
				{/*	[]*/}
				{/*</button>*/}
			</div>
		</div>
	)
};