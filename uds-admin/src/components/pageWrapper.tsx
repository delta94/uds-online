import React, {FC} from "react";
import {Divider, Typography} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrap: {
			display: 'flex',
			alignItems: 'flex-start',
			[theme.breakpoints.down(theme.breakpoints.values.md)]: {
				display: 'block'
			}
		},
		heading: {
			marginRight: 10,
			marginBottom: 10,
			flexGrow: 1
		},
		divider: {
			marginTop: '0.5rem',
			marginBottom: '1rem',
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
			{heading && <>
				<div className={classes.wrap}>
					<Typography variant="h6" className={classes.heading}>{heading}</Typography>
					{actionArea}
				</div>
				<Divider className={classes.divider}/>
			</>}
			{children}
		</>
	)
}