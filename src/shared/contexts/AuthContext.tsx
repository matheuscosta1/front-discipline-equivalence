import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthService, IAuthorizationDados, IForgotPasswordDados } from "../services/api/autenticacao/AutenticacaoService";

interface IAuthContextData {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | void> //espera a sessao do usuario acontecer, por isso é uma promise
  logout: () => void;
  forgot: (email: string) => Promise<string | void>;
}

const AuthContext = createContext({} as IAuthContextData)

interface IAuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({children}) => {

  const LOCAL_STORAGE_KEY_ACCESS_TOKEN = 'APP_ACCESS_TOKEN';

  const [accessToken, setAccessToken] = useState<string>();

  useEffect(
    () => {
      const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY_ACCESS_TOKEN);
      
      if(accessToken) {
        setAccessToken(JSON.parse(accessToken));
      } else {
        setAccessToken(undefined);
      }
    }, 
    []
  );

  const handleLogin = useCallback(async (email: string, password: string) => {

    const dados: IAuthorizationDados = {
      email: email,
      password: password
    };

    const result = await AuthService.auth(dados);
    if(result instanceof Error) {
      return result.message;
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACCESS_TOKEN, JSON.stringify(result.accessToken));
      setAccessToken(result.accessToken);
    }

  }, []);

  const handleForgotPassword = useCallback(async (email: string) => {

    const dados: IForgotPasswordDados = {
      email: email
    };

    const result = await AuthService.forgot(dados);
    if(result instanceof Error) {
      return result.message;
    } else {
      return result;
    }

  }, []);
  
  const handleLogout = useCallback( () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_ACCESS_TOKEN);
    setAccessToken(undefined);
  }, []);

  const isAuthenticated = useMemo(() => accessToken !== undefined, [accessToken]);

  return (
    <AuthContext.Provider value={{isAuthenticated, login: handleLogin, logout: handleLogout, forgot: handleForgotPassword}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);