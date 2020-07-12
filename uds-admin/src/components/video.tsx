import React, {FC, useEffect, useRef, useState} from "react";
import ReactPlayer, {ReactPlayerProps} from 'react-player';
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Fullscreen, Pause, PlayArrow, VolumeMute, VolumeOff} from "@material-ui/icons";
import {Grid, IconButton, Slider} from "@material-ui/core";

interface IVideoProps {
    src: string
}


interface IOnProgress {
    played: number,
    playedSeconds: number,
    loaded: number,
    loadedSeconds: number
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        wrap: {
            margin: '1rem auto',
            padding: '10px 0',
            backgroundColor: '#000000'
        },
        inner: {
            margin: '0 auto',
            width: 712,
            maxWidth: '100%',
            backgroundColor: '#FFFFFF'
        },
        video: {
            maxHeight: '400px',
            backgroundColor: '#000000',
            width: '100%',
            outline: 'none'
        },
        controls: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 5,
            padding: 7
        },
        playbackBtn: {
            marginRight: 10
        },
        timer: {
            margin: '0 10px'
        }
    }),
);

export const Video: FC<IVideoProps> = ({src}) => {
    const classes = useStyles();
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const ref = useRef<ReactPlayer | null>(null);
    const [currentPos, setCurrentPos] = useState(0);

    useEffect(() => {
        if (ref && ref.current && ref.current.getInternalPlayer()) {
            const videoEl = ref.current.getInternalPlayer() as HTMLVideoElement;
            videoEl.volume = muted ? 0 : 1;
        }
    }, [muted]);

    const handleClick = (event: React.SyntheticEvent | React.MouseEvent) => {
        if (event.type === "contextmenu") {
            event.preventDefault();
            return false;
        }
    };

    const handleSeekerChange = (event: React.ChangeEvent<{}>, value: number | number[]) => {
        if (ref && ref.current && !Array.isArray(value)) {
            (ref.current as ReactPlayer).seekTo(Math.floor(value));
        }
    };

    const goFullScreen = () => {
        if (ref && ref.current) {
            const videoEl = ref.current.getInternalPlayer() as HTMLVideoElement;
            videoEl.requestFullscreen();
        }
    };

    const onProgress = ({playedSeconds, ...rest}: IOnProgress) => {
        setCurrentPos(playedSeconds);
        console.log(rest);
    };

    const onReady = () => {
        if (ref && ref.current) {
            const videoEl = ref.current.getInternalPlayer() as HTMLVideoElement;
            videoEl.setAttribute("controlsList", "nodownload");
        }
    }

    const getFormattedTime = (sec: number) => {
        const minutes = Math.trunc(Math.floor(sec) / 60);
        const seconds = Math.floor(sec) % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return (
        <div className={classes.wrap}>
            <div className={classes.inner}>
                <ReactPlayer ref={ref}
                             onContextMenu={handleClick}
                             playing={playing}
                             width='100%'
                             style={{backgroundColor: '#000000'}}
                             controls={false}
                             height={400}
                             onReady={onReady}
                             onDuration={(s) => setDuration(Math.floor(s))}
                             onProgress={onProgress as any}
                             url={src + '?action=play'}
                />


                {duration > 0 && <div className={classes.controls}>
                    <IconButton aria-label={playing ? "pause" : "play"}
                                className={classes.playbackBtn}
                                onClick={() => setPlaying(!playing)}>
                        {playing ? <Pause/> : <PlayArrow/>}
                    </IconButton>

                    <IconButton aria-label={playing ? "pause" : "play"}
                                className={classes.playbackBtn}
                                onClick={() => setMuted(!muted)}>
                        {muted ? <VolumeMute/> : <VolumeOff/>}
                    </IconButton>

                    <Slider
                        value={currentPos}
                        max={duration}
                        color="primary"
                        style={{margin: '0 20px'}}
                        onChange={handleSeekerChange}
                        aria-labelledby="input-slider"
                    />

                    <span className={classes.timer}>{getFormattedTime(currentPos)}</span>

                    <IconButton onClick={goFullScreen} aria-label={"fullscreen"}>
                        <Fullscreen/>
                    </IconButton>
                </div>}
            </div>
        </div>
    )
};