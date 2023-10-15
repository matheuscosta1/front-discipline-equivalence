import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemProfessores {
  id: number;
  nome: string;
  faculdadeId: number;
  cursoId: number;
  disciplinaId: number;
  nomeCurso: number;
  nomeFaculdade: number;
  nomeDisciplina: number;
}

export interface IDetalheProfessores {
  id: number;
  nome: string;
  faculdadeId: number;
  cursoId: number;
  disciplinaId: number;
}


type TRegistroProfessorComTotalCount = {
  data: IListagemProfessores[];
  content: IListagemProfessores[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TRegistroProfessorComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/professores?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&nome=${filter}`;

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

const getProfessoresByDisciplinaId = async (page = 0, filter = '', disciplinaId: any): Promise<TRegistroProfessorComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/professores?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&disciplinaId=${disciplinaId}`;

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

const getById = async (id: number): Promise<IDetalheProfessores | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data } = await Api.get(`/professores/${id}`, headersConfig);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheProfessores, 'id'>): Promise<number | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data, status } = await Api.post<IDetalheProfessores>('/professores', dados, headersConfig);

    if (status === 200) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheProfessores): Promise<void | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    await Api.put(`/professores/${id}`, dados, headersConfig);
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
    await Api.delete(`/professores/${id}`, headersConfig);
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

export const ProfessoresService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getProfessoresByDisciplinaId
};
