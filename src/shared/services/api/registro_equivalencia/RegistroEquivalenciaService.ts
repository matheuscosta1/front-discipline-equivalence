import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemRegistroEquivalencia {
  id: number;
  cursoOrigem: string;
  cursoDestino: string;
  professorAnalisador: string;
  status: string;
}

export interface IDetalheRegistroEquivalencia {
  id: number;
  cursoOrigem: string;
  cursoDestino: string;
}


type TRegistroEquivalenciaComTotalCount = {
  data: IListagemRegistroEquivalencia[];
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TRegistroEquivalenciaComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/registro_equivalencia?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&cursoOrigem_like=${filter}`;

    const { data, headers } = await Api.get(urlRelativa, headersConfig);

    if (data) {
      return {
        data,
        totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
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
    const { data } = await Api.get(`/registro_equivalencia/${id}`, headersConfig);

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
    const { data, status } = await Api.post<IDetalheRegistroEquivalencia>('/registro_equivalencia', dados, headersConfig);

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
    await Api.put(`/registro_equivalencia/${id}`, dados, headersConfig);
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
    await Api.delete(`/registro_equivalencia/${id}`, headersConfig);
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
