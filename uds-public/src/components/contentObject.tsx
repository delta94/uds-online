import React, {FC, useEffect, useState} from "react";
import {api_request} from "../helpers/api";
import {Video} from "./video";
import {ComponentSpinner} from "./spinner";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

interface IContentObjectProps {
	alias: string,
	wide?: boolean
}

interface GetPathResponse {
	path: string,
	type: string
}

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

export const ContentObject: FC<IContentObjectProps> = ({alias, wide}) => {
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
		return <Video wide={!!wide} src={response.path}  />
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

export default ContentObject;
