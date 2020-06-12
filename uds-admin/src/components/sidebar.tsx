import React, {FC, useState} from "react";
import clsx from 'clsx';
import {Divider, List as ListComp , ListItem, ListItemIcon, ListItemText, useTheme} from "@material-ui/core";
import {MenuBook, Person, Message, Dashboard, PermMedia, MonetizationOn, SvgIconComponent} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import {ROUTES, ROLES} from "../constants";
import {useSelector} from "react-redux";
import {IReducerState} from "../reducers";

const {ROLE_ADMIN, ROLE_ASSISTANT} = ROLES;
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
export const Sidebar: FC<ISidebarProps> = ({isOpen}) => {
	const classes = useStyles();
	const theme = useTheme();
	const authState = useSelector((state: IReducerState) => state.auth);
	const [role] = useState(authState.role);
	
	return (
		<aside className={clsx(classes.root, {[classes.isOpen]: isOpen})}>
			<ListComp component="nav">
				<OptionalListItem role={role!}
								  roles={[ROLE_ADMIN, ROLE_ASSISTANT]}
								  svgIcon={Dashboard}
								  route={ROUTES.HOME}
								  text="Dashboard"
				/>
				
				<OptionalListItem role={role!} roles={[ROLE_ADMIN]}
								  svgIcon={Person}
								  route={ROUTES.USERS}
								  text="Учетные записи"
				/>
				
				<OptionalListItem role={role!}
								  roles={[ROLE_ADMIN]}
								  svgIcon={MenuBook}
								  route={ROUTES.COURSES}
								  text="Курсы"
				/>
				
				<OptionalListItem role={role!}
								  roles={[ROLE_ADMIN]}
								  svgIcon={PermMedia}
								  route={ROUTES.ASSETS}
								  text="Ресурсы"
				/>
				
				<OptionalListItem role={role!}
								  roles={[ROLE_ADMIN]}
								  svgIcon={MonetizationOn}
								  route={ROUTES.PURCHASES}
								  text="Продажи"
				/>
				
				<OptionalListItem role={role!}
								  roles={[ROLE_ADMIN, ROLE_ASSISTANT]}
								  svgIcon={Message}
								  route={ROUTES.MESSAGES}
								  text="Сообщения"
				/>
			</ListComp>
		</aside>
	)
}