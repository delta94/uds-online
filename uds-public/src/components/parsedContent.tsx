import React, {FC, useEffect, useState} from "react";
import parse from "html-react-parser";
import {Video} from "./video";
import {api_request} from "../helpers/api";
import {ComponentSpinner} from "./spinner";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		imageWrap: {
			display: 'block',
			textAlign: 'center',
			margin: '10px 0'
		},
		image: {
			maxWidth: '100%',
			maxHeight: 900
		},
		
	})
);
interface GetPathResponse {
	path: string,
	type: string
}

interface IParsedContentProps {
	content: string;
}
/**
 * Parses a string to HTML. When a special markup found, replaces it to a relevant React Component.
 * Example:
 *
 * {{1234567890ab}} - asset alias
 *
 * @param content {string}
 * @constructor
 */
export const ParsedContent: FC<IParsedContentProps> = ({content}) => {
	let p = (parse(content.replace(/{{(.*)}}/g, '<div data-alias="$1"></div>')) as JSX.Element[]);
	if (p && p.map) {
		p = p.map((el, key) => {
			if (!el.props) {
				return el;
			}
			const alias = el.props['data-alias'];
			if (alias) {
				return <ContentObject key={alias + key} alias={alias}/>
			}
			return el;
		});
	}
	return (
		<>
			{p}
		</>
	);
}
interface IContentObjectProps {
	alias: string
}
const ContentObject: FC<IContentObjectProps> = ({alias}) => {
	const classes = useStyles();
	const [response, setResponse] = useState<GetPathResponse>();
	useEffect(() => {
		api_request<GetPathResponse>({
			method: "GET",
			url: `uploads/${alias}`
		})
			.then(({path, type}) => setResponse({
				path: `${process.env.REACT_APP_HOST_API}/${path}`,
				type
			}))
	}, []);
	
	if (response && response.type === "video") {
		return <Video src={response.path} />
	}
	if (response && response.type === "audio") {
		return <></>;
	}
	if (response && response.type === "image") {
		return <picture className={classes.imageWrap}>
			<img className={classes.image} src={response.path} alt="Изображение"/>
		</picture>
	}
	return (
		<>
			<ComponentSpinner />
		</>
	)
}