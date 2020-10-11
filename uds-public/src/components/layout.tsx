import React, {FC, useState} from 'react';
import {Header} from "./header";
import {makeStyles} from "@material-ui/core/styles";
import {Sidebar} from "./sidebar";

const SIDEBAR_WIDTH = 225;
const MAX_WIDTH = 1000;

const useStyles = makeStyles((theme) => ({
	body: {
		paddingTop: 10,
		display: 'flex',
		maxWidth: MAX_WIDTH,
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	content: {
		padding: "1rem 1rem 2rem 1rem",
		flexGrow: 1,
		maxWidth: '100%',
		width: `calc(100% - ${SIDEBAR_WIDTH}px)`
	},
}));

export const Layout: FC = ({children}) => {
	const classes = useStyles();
	const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
	return(
		<>
			<Header onBurgerClick={() => setSidebarOpen(!isSidebarOpen)}/>
			<section className={classes.body}>
				<Sidebar isOpen={isSidebarOpen} width={SIDEBAR_WIDTH}/>
				<div className={classes.content}>
					{children}
				</div>
			</section>
		</>
	)
}
