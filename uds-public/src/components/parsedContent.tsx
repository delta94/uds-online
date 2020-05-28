import React, {FC} from "react";
import parse from "html-react-parser";
import {Video} from "./video";

interface IParsedContentProps {
	content: string;
}
/**
 * Parses a string to HTML. When a special markup found, replaces it to a relevant React Component.
 * Example:
 *
 * {{[video|video.mp4]}} - video tag
 *
 * @param content {string}
 * @constructor
 */
export const ParsedContent: FC<IParsedContentProps> = ({content}) => {
	const p = (parse(content.replace(/{{\[video\|(.*)\]}}/g, '<div video-object="$1"></div>')) as JSX.Element[])
		.map((el, key) => {
			if (!el.props) {
				return el;
			}
			const videoObject = el.props['video-object'];
			if (videoObject) {
				return <Video key={key} src={videoObject.trim()} />
			}
			return el;
		});
	return (
		<>
			{p}
		</>
	);
}