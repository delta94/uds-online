import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IReducerState} from "../reducers";
import {PageWrapper} from "../components/pageWrapper";
import {ParsedContent} from "../components/parsedContent";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({}),
);

function HomePage() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const authState = useSelector((state: IReducerState) => state.auth);
	
	const cnt = `
<div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolore itaque labore quidem sequi
veritatis! Accusamus atque eaque error praesentium, quod ullam voluptatum. Ad alias amet asperiores aut
nemo totam!
</div>
<div>Accusantium animi aut libero sint! Aliquam beatae facere iure mollitia optio qui sequi? Accusantium ad
consequuntur cum enim, impedit inventore non quas quasi, quia quisquam ratione reprehenderit sapiente
voluptatibus, voluptatum.
</div>
{{[video|demovideo.mov]}}
<div>Dolores earum et exercitationem ipsum magni nesciunt nihil nostrum reiciendis! Accusantium debitis ea
enim, iusto quidem suscipit. Ea eveniet, explicabo facere incidunt natus odio quis rerum, sed suscipit
voluptatibus, voluptatum?
</div>

{{[video|demovideo-small.mov]}}
<div>Alias aliquid assumenda atque, cum deserunt dolorem enim error ipsam laudantium molestiae nemo optio
pariatur placeat quibusdam repellendus sapiente sit soluta suscipit voluptate voluptates? Dolor minima
nisi nulla numquam veritatis!
</div>
<div>Deserunt distinctio facilis hic neque, quod similique veritatis! Cupiditate ipsa sint veritatis? Cumque
dolorem dolorum fuga laborum maxime, obcaecati quibusdam sint sit tempore! Deleniti ea esse mollitia
odit. Explicabo, sequi.
</div>
	`;
	
	return (
		<PageWrapper heading="Dashboard">
			<ParsedContent content={cnt}/>
		</PageWrapper>
	);
}

export default HomePage;
