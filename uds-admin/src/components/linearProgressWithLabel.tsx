import React, {FC} from "react";
import {Box, LinearProgress, LinearProgressProps, Typography} from "@material-ui/core";

interface ILinearProgressWithLabelProps extends LinearProgressProps {
	value: number
}

export const LinearProgressWithLabel: FC<ILinearProgressWithLabelProps> = ({value}) => {
	return (
		<Box display="flex" alignItems="center">
			<Box width="100%" mr={1}>
				<LinearProgress variant="determinate" value={value} color="secondary"/>
			</Box>
			<Box minWidth={35}>
				<Typography variant="body2" color="textSecondary">{`${Math.round(value,)}%`}</Typography>
			</Box>
		</Box>
	);
};