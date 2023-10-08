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
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TRegistroProfessorComTotalCount | Error> => {
  try {
    const urlRelativa = `/professores?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&nome_like=${filter}`;

    const { data, headers } = await Api.get(urlRelativa);

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

const getProfessoresByDisciplinaId = async (page = 1, filter = '', disciplinaId: any): Promise<TRegistroProfessorComTotalCount | Error> => {
  try {
    const urlRelativa = `/professores?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&disciplinaId_like=${disciplinaId}`;

    const { data, headers } = await Api.get(urlRelativa);

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

const getById = async (id: number): Promise<IDetalheProfessores | Error> => {
  try {
    const { data } = await Api.get(`/professores/${id}`);

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
  try {
    const { data } = await Api.post<IDetalheProfessores>('/professores', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheProfessores): Promise<void | Error> => {
  try {
    await Api.put(`/professores/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/professores/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const ProfessoresService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getProfessoresByDisciplinaId
};
