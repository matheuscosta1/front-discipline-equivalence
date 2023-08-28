import { createTheme } from '@mui/material';
import { cyan, purple, yellow } from '@mui/material/colors';

export const DarkTheme = createTheme({
  palette: {
    mode: 'dark',
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
      paper: '#303134',
      default: '#202124',
    },
  },
  typography: {
    allVariants: {
      color: 'white',
    }
  }
});
