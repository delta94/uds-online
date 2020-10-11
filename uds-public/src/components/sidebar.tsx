import React, {FC, useState} from "react";
import clsx from 'clsx';
import {List as ListComp , ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {MenuBook, Person, Message, Dashboard, PermMedia, MonetizationOn, SvgIconComponent} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import {ROUTES, ROLES} from "../constants";
import {useSelector} from "react-redux";
import {IReducerState} from "../reducers";

const {ROLE_USER} = ROLES;

const useStyles = (sidebar_width: number) => makeStyles((theme) => ({
	root: {
		position: 'relative',
		width: sidebar_width,
		background: '#FFFFFF',
		flexShrink: 0,
		zIndex: 10,
		transition: 'ease 300ms',
		[theme.breakpoints.down('xs')]: {
			marginLeft: `-${sidebar_width}px`,
			display: 'block',
		},
		display: 'none',
		marginLeft: `-${sidebar_width}px`
	},
	isOpen: {
		[theme.breakpoints.down('xs')]: {
			transform: `translateX(${sidebar_width}px)`
		}
		
	}
}));

export interface ISidebarProps {
	isOpen: boolean,
	width: number
}

interface IOptionalListItemProps {
	route: string,
	svgIcon: SvgIconComponent,
	role: number,
	roles: number[],
	text: string,
	subtext?: string
}
const OptionalListItem: FC<IOptionalListItemProps> = (props) => {
	const {route, svgIcon: SvgIcon, text, subtext, role, roles} = props;
	if (!roles.includes(role)) {
		return null;
	}
	return (
		<ListItem button component={Link} to={route}>
			<ListItemIcon><SvgIcon/></ListItemIcon>
			<ListItemText primary={text} />
			{subtext && <ListItemText secondary={subtext} />}
		</ListItem>
	)
}
export const Sidebar: FC<ISidebarProps> = ({isOpen, width}) => {
	const classes = useStyles(width)();
	const authState = useSelector((state: IReducerState) => state.auth);
	const [role] = useState(authState.role);
	
	return (
		<aside className={clsx(classes.root, {[classes.isOpen]: isOpen})}>
			<ListComp component="nav">
				<OptionalListItem role={role!}
								  roles={[ROLE_USER]}
								  svgIcon={Dashboard}
								  route={ROUTES.ACCOUNT}
								  text="Dashboard"
				/>
				
				<OptionalListItem role={role!}
								  roles={[ROLE_USER]}
								  svgIcon={MenuBook}
								  route={ROUTES.COURSES}
								  text="Курсы"
				/>
				
				
				<OptionalListItem role={role!}
								  roles={[ROLE_USER]}
								  svgIcon={Message}
								  route={ROUTES.MESSAGES}
								  text="Сообщения"
				/>
			</ListComp>
		</aside>
	)
}
