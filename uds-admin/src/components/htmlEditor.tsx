import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/webpack-resolver";
import React, {FC} from "react";
import {AceOptions} from "react-ace/types";

interface IHtmlEditorProps {
	name: string,
	content: string,
	onChange: (value: string, event?: any) => void,
	placeholder?: string,
	options?: AceOptions
}
const HtmlEditor: FC<IHtmlEditorProps> = ({name, content, onChange, placeholder, options}) => {
	return (
		<AceEditor
			width="100%"
			mode="html"
			placeholder={placeholder}
			value={content}
			theme="xcode"
			onChange={onChange}
			name={name}
			setOptions={options}
			editorProps={{ $blockScrolling: true}}
		/>
	)
}

export default HtmlEditor;