import {createMuiTheme} from '@material-ui/core/styles';

export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#0091ff',
			light: '#6ec4ff',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#ffffff',
			light: '#c5c2be',
			contrastText: '#000000',
		},
		error: {
			main: '#cd0008',
		}
	},
});
