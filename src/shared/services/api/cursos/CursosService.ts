import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemCurso {
  id: number;
  faculdadeId: number;
  nome: string;
  nomeFaculdade: string;
}

export interface IDetalheCurso {
  id: number;
  faculdadeId: number;
  nome: string;
}

type TCursosComTotalCount = {
  data: IListagemCurso[];
  content: IListagemCurso[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TCursosComTotalCount | Error> => {
  try {
    const headersConfig = {
      headers: getAuthorizationHeaders(),
    };

    console.log(page);
    const urlRelativa = `/cursos?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&nome=${filter}`;

    console.log(urlRelativa);
    
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

const getById = async (id: number): Promise<IDetalheCurso | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data } = await Api.get(`/cursos/${id}`, headersConfig);
    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};


const getByFaculdadeId = async (page = 0, filter = '', faculdadeId: any): Promise<TCursosComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/cursos?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS_ILIMITADO}&faculdadeId=${faculdadeId}`;

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

const create = async (dados: Omit<IDetalheCurso, 'id'>): Promise<IDetalheCurso | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data , status } = await Api.post<IDetalheCurso>('/cursos', dados, headersConfig);

    if (status === 200) {
      return data;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheCurso): Promise<void | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    await Api.put(`/cursos/${id}`, dados, headersConfig);
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
    await Api.delete(`/cursos/${id}`, headersConfig);
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

export const CursosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getByFaculdadeId
};
