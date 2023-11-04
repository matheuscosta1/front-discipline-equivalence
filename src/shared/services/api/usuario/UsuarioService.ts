import { Api } from '../axios-config';
import 'react-toastify/dist/ReactToastify.css'; 


export interface IListagemUsuario {
  id: number;
  nome: string;
  email: string;
}

export interface IDetalheUsuario {
  nome: string;
  email: string;
  novoEmail: string;
  senhaAtual: string;
  novaSenha: string;
}

type TDetalheUsuarioComTotalCount = {
  data: IListagemUsuario[];
  content: IListagemUsuario;
  totalCount: number;
}

const getByEmail = async (email: string): Promise<TDetalheUsuarioComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data } = await Api.get(`/usuario/dados/${email}`, headersConfig);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const update = async (dados: IDetalheUsuario): Promise<void | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    await Api.put(`/usuario/atualizar-dados`, dados, headersConfig);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

function getAuthorizationHeaders() {
  const token = localStorage.getItem('APP_ACCESS_TOKEN');

  if (token) {
    return {
      Authorization: `Bearer ${JSON.parse(token || '')}`,
    };
  }

  return undefined;
}

export const UsuarioService = {
  update,
  getByEmail
};
