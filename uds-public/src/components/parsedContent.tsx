import React, {FC} from "react";
import parse from "html-react-parser";
import ContentObject from "./contentObject";

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
	let p = (parse(content.replace(/{{(.*)}}/g, '<div data-alias="$1"></div>')));
	if (!p) {
		return (
			<>
				{p}
			</>
		);
	}
	// @ts-ignore
	if (!p.map) {
		// @ts-ignore
		p = [p];
	}
	p = p as JSX.Element[];
	if (p.map) {
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

export default ParsedContent;
