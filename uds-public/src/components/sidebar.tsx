import React, {FC} from "react";
import clsx from 'clsx';
import {Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, useTheme} from "@material-ui/core";
import {Create, MenuBook, Message, Dashboard} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import {ROUTES} from "../constants";


const sidebarWidth = 240;

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'relative',
		width: sidebarWidth,
		background: '#FFFFFF',
		flexShrink: 0,
		transition: 'ease 300ms',
		[theme.breakpoints.down('xs')]: {
			marginLeft: `-${sidebarWidth}px`
		}
	},
	isOpen: {
		[theme.breakpoints.down('xs')]: {
			transform: `translateX(${sidebarWidth}px)`
		}
		
	}

}));

export interface ISidebarProps {
	isOpen: boolean
}
export const Sidebar: FC<ISidebarProps> = ({isOpen}) => {
	const classes = useStyles();
	const theme = useTheme();
	const [open, setOpen] = React.useState(true);
	
	const handleDrawerOpen = () => {
		setOpen(true);
	};
	
	const handleDrawerClose = () => {
		setOpen(false);
	};
	
	return (
		<aside className={clsx(classes.root, {[classes.isOpen]: isOpen})}>
			<List component="nav">
				<ListItem button component={Link} to={ROUTES.ACCOUNT}>
					<ListItemIcon><Dashboard/></ListItemIcon>
					<ListItemText primary="Dashboard" />
				</ListItem>
				<ListItem button component={Link} to={ROUTES.MESSAGES}>
					<ListItemIcon><Message/></ListItemIcon>
					<ListItemText primary="My messages" />
				</ListItem>
				<ListItem button component={Link} to={ROUTES.COMPOSE_MESSAGE}>
					<ListItemIcon><Create/></ListItemIcon>
					<ListItemText primary="Compose message" />
				</ListItem>
			</List>
			
		</aside>
	)
}