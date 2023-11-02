import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { Box } from '@mui/system';

import { DarkTheme, LightTheme } from './../themes';

interface IThemeContextData {
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext({} as IThemeContextData);

export const useAppThemeContext = () => {
  return useContext(ThemeContext);
};

export const AppThemeProvider: React.FC = ({ children }) => {
  
  const storedTheme = localStorage.getItem('theme');
  const [themeName, setThemeName] = useState<'light' | 'dark'>(() => {
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    } else {
      return 'light'; 
    }
  });

  const toggleTheme = useCallback(() => {
    setThemeName((oldThemeName) => (oldThemeName === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => {
    if (themeName === 'light') return LightTheme;
    return DarkTheme;
  }, [themeName]);

  
  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <Box width="100vw" height="100vh" bgcolor={theme.palette.background.default}>
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};


