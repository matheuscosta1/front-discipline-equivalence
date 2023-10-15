import { BrowserRouter } from 'react-router-dom';

import './shared/forms/TraducoesYup';

import { AppThemeProvider, AuthProvider, DrawerProvider } from './shared/contexts';
import { Login, MenuLateral } from './shared/components';
import { AppRoutes } from './routes';
import { ToastContainer } from 'react-toastify'; // Importe o ToastContainer
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  return (
    <AuthProvider>
      <AppThemeProvider>
          <Login>
            <DrawerProvider>
              <BrowserRouter>

                <MenuLateral>
                  <AppRoutes />
                </MenuLateral>

              </BrowserRouter>
            </DrawerProvider>
            
          </Login>
        <ToastContainer />
      </AppThemeProvider>
    </AuthProvider>
  );
};
