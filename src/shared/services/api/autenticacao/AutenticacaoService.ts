import { Api } from '../axios-config';
import { toast } from 'react-toastify'; // Importe o react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importe os estilos do react-toastify


interface IAuth {
  accessToken: string;
}

export interface IForgotPasswordDados {
  email: string;
}

export interface IAuthorizationDados {
  email: string;
  password: string;
}

const auth =  async (dados: Omit<IAuthorizationDados, 'id'>): Promise <IAuth | Error>=> {
  try {
    const { data } = await Api.post(`/login`, dados); //esse get tem que ser um POST quando integrar com o backend

    console.log("Teste");

    if (data) { //data é o accessToken
      return data;
    }

    return new Error('Erro no login.');
  } catch (error) {
    console.error(error);

    // Exiba uma mensagem de erro para o usuário
    toast.error('Ocorreu um erro durante o login. Revise suas credenciais.');

    return new Error((error as { message: string }).message || 'Erro no login.');
  }
};

const forgot =  async (dados: Omit<IForgotPasswordDados, 'id'>): Promise <void | Error>=> {
  try {
    const { status} = await Api.post(`/auth/forgot`, dados)

    if (status === 204) { 
      return
    }

    return new Error('Erro ao gerar novo password.');
  } catch (error) {
    console.error(error);

    return new Error((error as { message: string }).message || 'Erro no login.');
  }
};


export const AuthService = {
  auth,
  forgot,
};
