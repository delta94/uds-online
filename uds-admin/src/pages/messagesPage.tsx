import React from "react";

import {getMessageUrl} from "../helpers/getUrl";
import {Link} from "react-router-dom";

import {PageWrapper} from "../components/pageWrapper";


export function MessagesPage() {
 
	return (
		<PageWrapper heading="Cообщения">
			<Link to={getMessageUrl(55)}>test</Link>
		</PageWrapper>
	);
}

export default MessagesPage;
