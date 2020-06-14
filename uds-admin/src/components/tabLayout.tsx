import React, {FC, ReactNode, useState} from "react";
import {Tabs, Tab} from "@material-ui/core";

interface TabPanelProps {
	children?: ReactNode;
	index: any;
	value: any;
}

interface ITab {
	id: number,
	value: string,
	label: string,
	panelContent: ReactNode
}

interface ITabLayoutProps {
	tabs: ITab[],
	selected: string
}

function TabPanel(props: TabPanelProps) {
	const {children, value, index, ...other} = props;
	return (
		<div role="tabpanel" hidden={value !== index}{...other}>
			{value === index && <>{children}</>}
		</div>
	);
}

export const TabLayout: FC<ITabLayoutProps> = ({tabs, selected}) => {
	const [tab, setTab] = useState<string>(selected);
	return (
		<>
			<Tabs value={tab} onChange={(e, value) => setTab(value)} indicatorColor="primary">
			{tabs.map((t) => {
				return (
					<Tab key={'t'+t.id} value={t.value} label={t.label}/>
				)
			})}
			</Tabs>
			{tabs.map((t) => {
				return (
					<TabPanel key={'tp'+t.id} value={tab} index={t.value}>
						{t.panelContent}
					</TabPanel>
				)
			})}
		</>
	);
};