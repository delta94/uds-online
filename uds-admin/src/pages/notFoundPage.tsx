import React, {FC} from "react";
import {PageWrapper} from "../components/pageWrapper";
import {Typography} from "@material-ui/core";



const NotFoundPage: FC = () => {
	
	
	return (
		<PageWrapper heading="404">
		<Typography variant='body1'>
			Страница, которую вы хотите открыть, не найдена.
		</Typography>
		</PageWrapper>
	);
}

export default NotFoundPage;
