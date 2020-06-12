import React, {FC} from "react";
import {Divider, Typography} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			display: 'flex',
			marginBottom: 10,
			alignItems: 'center'
		},
		heading: {
			marginRight: 10,
			marginBottom: 10,
			flexGrow: 1
		},
		divider: {
			marginBottom: '1rem'
		}
	}),
);

export interface IPageWrapperProps {
	heading?: string;
	actionArea?: React.ReactNode
}

export const PageWrapper: FC<IPageWrapperProps> = ({heading, actionArea, children}) => {
	const classes = useStyles();
	return (
		<>
			{heading && <div className={classes.wrap}>
				<Typography variant="h5" className={classes.heading}>{heading}</Typography>
				{actionArea}
				<Divider className={classes.divider}/>
			</div>}
			{children}
		</>
	)
}