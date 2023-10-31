import { createTheme } from '@mui/material';

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
      paper: '#E0E0E0',  // Cinza suave para a cor de fundo do papel
      default: '#E0E0E0',  // Cinza suave para a cor de fundo padrão
    }
  }
});
