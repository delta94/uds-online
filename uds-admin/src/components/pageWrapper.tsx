import React, {FC} from "react";
import {Divider, Typography} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		divider: {
			marginBottom: '1rem'
		}
	}),
);

export interface IPageWrapperProps {
	heading?: string;
}

export const PageWrapper: FC<IPageWrapperProps> = ({heading, children}) => {
	const classes = useStyles();
	return (
		<>
			{heading && <>
				<Typography gutterBottom variant="h5">{heading}</Typography>
				<Divider className={classes.divider}/>
			</>}
			{children}
		</>
	)
}