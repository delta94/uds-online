import React, {FC, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {Mail, Menu as MenuIcon, MoreVert, ExitToAppOutlined, MenuBook} from '@material-ui/icons';
import {Button} from "@material-ui/core";
import {log_out} from "../actions";
import {useDispatch} from "react-redux";
import red from '@material-ui/core/colors/red';
import {ROUTES} from "../constants";
import {Link} from "react-router-dom";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
	grow: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
		display: 'block',
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	title: {
		display: 'none',
		marginRight: 30,
		[theme.breakpoints.up('sm')]: {
			display: 'block',
		},
	},
	logout: {
		color: '#FFFFFF',
		backgroundColor: '#dc3545',
		borderColor: '#dc3545',
		['&:hover']: {
			backgroundColor: '#c82333',
			borderColor: '#bd2130',
		},
		marginLeft: '1rem'
	},
	logoutMobile: {
		color: red[800]
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: '20ch',
		},
	},
	sectionDesktop: {
		display: 'none',
		alignItems: 'center',
		[theme.breakpoints.up('sm')]: {
			display: 'flex',
		},
	},
	sectionMobile: {
		display: 'flex',
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
}));

export interface IHeaderProps {
	onBurgerClick: Function
}

export const Header: FC<IHeaderProps> = ({onBurgerClick}) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<EventTarget & Element | null>(null);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
	const unreadMessages = 0;
	
	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null);
	};
	
	const handleMobileMenuOpen = (event: React.SyntheticEvent | React.MouseEvent) => {
		setMobileMoreAnchorEl(event.currentTarget);
	};
	
	const mobileMenuId = 'menu-mobile';
	const renderMobileMenu = (
		<Menu
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{vertical: 'top', horizontal: 'right'}}
			id={mobileMenuId}
			keepMounted
			transformOrigin={{vertical: 'top', horizontal: 'right'}}
			open={isMobileMenuOpen}
			onClick={handleMobileMenuClose}
			onClose={handleMobileMenuClose}
		>
			<MenuItem component={Link} to={ROUTES.MESSAGES}>
				<IconButton color="inherit" >
					{unreadMessages ?
						<Badge badgeContent={unreadMessages} color="secondary">
							<Mail/>
						</Badge>
						:
						<Mail/>
					}
				</IconButton>
				<p>Messages</p>
			</MenuItem>
			
			<MenuItem className={classes.logoutMobile}>
				<IconButton color="inherit" onClick={() => dispatch(log_out())}>
					<ExitToAppOutlined/>
				</IconButton>
				<p>Log out</p>
			</MenuItem>
		</Menu>
	);
	
	return (
		<div className={classes.grow}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						edge="start"
						className={classes.menuButton}
						color="inherit"
						onClick={() => onBurgerClick()}
					>
						<MenuIcon/>
					</IconButton>
					<Typography className={classes.title} variant="h6" noWrap>
						UNDOSTRES|ONLINE
					</Typography>
					
					<div className={clsx(classes.sectionDesktop, classes.grow)}>
						<Button startIcon={<MenuBook />} color="inherit" component={Link}  to={ROUTES.COURSES}>
							Курсы
						</Button>
						<Button
							startIcon={unreadMessages ?
								<Badge badgeContent={unreadMessages} color="secondary">
									<Mail/>
								</Badge>
								:
								<Mail />
							}
							color="inherit"
							component={Link}
							to={ROUTES.MESSAGES}>
							Сообщения
						</Button>
						
						<div className={classes.grow}/>
						
						<Button variant="outlined" size="medium" className={classes.logout} onClick={() => dispatch(log_out())}>
							Log out
						</Button>
					</div>
					
					<div className={clsx(classes.grow, classes.sectionMobile)}>
						
						<div className={classes.grow}/>
						
						<IconButton
							aria-label="Show more"
							aria-controls={mobileMenuId}
							aria-haspopup="true"
							onClick={handleMobileMenuOpen}
							color="inherit"
						>
							<MoreVert/>
						</IconButton>
					</div>
				</Toolbar>
			</AppBar>
			{renderMobileMenu}
		</div>
	);
}
