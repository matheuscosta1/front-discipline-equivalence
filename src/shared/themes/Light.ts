import { createTheme } from '@mui/material';
import { cyan, yellow } from '@mui/material/colors';

export const LightTheme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
      dark: '#c2185b',
      light: '#f48fb1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f06292',
      dark: '#c2185b',
      light: '#fce4ec',
      contrastText: '#f8bbd0',
    },
    background: {
      paper: '#ffffff',
      default: '#f7f6f3',
    }
  }
});
