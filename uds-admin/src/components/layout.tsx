import React, {FC, useState} from 'react';
import {Header} from "./header";
import {BrowserRouter as Router} from "react-router-dom";
import {makeStyles} from "@material-ui/core/styles";
import {Sidebar} from "./sidebar";


const useStyles = makeStyles((theme) => ({
	body: {
		paddingTop: "70px",
		display: 'flex',
		maxWidth: '1920px',
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	content: {
		padding: "1rem 1rem 0 1rem",
		flexGrow: 1
	},
}));

export const Layout: FC = ({children}) => {
	const classes = useStyles();
	const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
	return(
		<>
			<Header onBurgerClick={() => setSidebarOpen(!isSidebarOpen)}/>
			<section className={classes.body}>
				<Sidebar isOpen={isSidebarOpen}/>
				<div className={classes.content}>
					{children}
				</div>
			</section>
		</>
	)
}