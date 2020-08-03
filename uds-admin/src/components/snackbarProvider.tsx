import React, {FC} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import {IconButton} from '@material-ui/core';
import {useDispatch, useSelector} from 'react-redux';
import {Close} from '@material-ui/icons';
import {capitalize} from 'lodash';
import {close_message, exit_message} from '../actions';
import {IReducerState} from '../reducers';


const SnackbarProvider: FC = () => {
	const dispatch = useDispatch();
	const state = useSelector((state: IReducerState) => state.snack);
	const {message, key} = state.messageInfo;
	
	function handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
		dispatch(close_message(reason!));
	}
	
	function handleExited() {
		dispatch(exit_message());
	}
	
	return (
		<Snackbar
			key={key}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left',
			}}
			open={state.open}
			autoHideDuration={6000}
			onClose={handleClose}
			onExited={handleExited}
			ContentProps={{
				'aria-describedby': 'snack-message-id',
			}}
			message={<span dangerouslySetInnerHTML={{__html: capitalize(message)}} className="snack-message-id" />}
			action={
				<IconButton component="span" key="close" aria-label="Close" color="inherit" onClick={handleClose}>
					<Close/>
				</IconButton>
			}
		/>
	)
}
export default SnackbarProvider;