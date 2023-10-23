import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemRegistroEquivalencia {
  id: number;
  codigoDisciplinaOrigem: string;
  nomeDisciplinaOrigem: string;
  faculdadeOrigem: string;
  cursoOrigem: string;
  codigoDisciplinaDestino: string;
  nomeDisciplinaDestino: string;
  faculdadeDestino: string;
  cursoDestino: string;
  nomeProfessor: string;
  equivalente: string;
  dataCriacao: string;
}

export interface IDetalheRegistroEquivalencia {
  id: number;
  justificativa: string;
  equivalente: boolean;
  faculdadeOrigemId: number;
  faculdadeDestinoId: number;
  disciplinaOrigemId: number;
  disciplinaDestinoId: number;
}

type TRegistroEquivalenciaComTotalCount = {
  data: IListagemRegistroEquivalencia[];
  content: IListagemRegistroEquivalencia[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TRegistroEquivalenciaComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/equivalencias?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&codigo=${filter}`;

    const { data, headers } = await Api.get(urlRelativa, headersConfig);

    if (data) {
      return {
        data,
        totalCount: Number(headers['x-total-count'] || data.totalElements || Environment.LIMITE_DE_LINHAS),
        content: data.content
      };
    }

    return new Error('Erro ao listar os registros.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
  }
};

const getById = async (id: number): Promise<IDetalheRegistroEquivalencia | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data } = await Api.get(`/equivalencias/${id}`, headersConfig);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheRegistroEquivalencia, 'id'>): Promise<number | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data, status } = await Api.post<IDetalheRegistroEquivalencia>('/registro-equivalencia', dados, headersConfig);

    if (status === 200) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheRegistroEquivalencia): Promise<void | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    await Api.put(`/registro-equivalencia/${id}`, dados, headersConfig);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    await Api.delete(`/equivalencias/${id}`, headersConfig);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
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

export const RegistroEquivalenciaService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
};
