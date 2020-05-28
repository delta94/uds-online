import React, {useEffect, useState, useRef, FC} from "react";
import {css} from "@emotion/core";
import {ScaleLoader as Animation} from "react-spinners";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";
import Fade from '@material-ui/core/Fade';

const override = css`
display: inline-block;
margin-bottom: 4rem;
`;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			position: 'fixed',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0,
			zIndex: 100000,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			textAlign: 'center'
		},
		text: {
			color: "rgb(128,128,128)",
		}
	})
);

export const Spinner: FC = () => {
	const t = useRef<unknown>();
	const classes = useStyles();
	const [isVisible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		t.current = setTimeout(() => setVisible(true), 300);
		return () => {
			if (t && t.current) {
				clearTimeout(t.current as number);
			}
		};
	}, []);
	return (
		<div className={classes.wrap}>
			<Fade in={isVisible} timeout={500}>
				<div>
					<Animation
						css={override}
						color={"#8c8e96"}
						loading={true}
					/>
					<div>
						<Typography variant="subtitle1" className={classes.text}>
							Loading. Please wait...
						</Typography>
					</div>
				</div>
			</Fade>
		</div>
	)
};