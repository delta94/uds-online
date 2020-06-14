import {createMuiTheme} from '@material-ui/core/styles';

export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#0091ff',
			light: '#6ec4ff',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#2f7d3c',
			light: '#ad7325',
			contrastText: '#000000',
		},
		danger: {
			main: "#dc3545",
			light: "#c82333",
			contrastText: "#FFFFFF"
		},
		success: {
			main: "#218838",
			light: "#28a745",
			contrastText: "#FFFFFF"
		},
		error: {
			main: '#cd0008',
		}
	},
});
declare module "@material-ui/core/styles/createPalette" {
	interface Palette {
		danger: Palette['primary'];
		success: Palette['primary'];
	}
	interface PaletteOptions {
		danger: PaletteOptions['primary'];
	}
}