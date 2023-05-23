import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemCurso {
  id: number;
  faculdadeId: number;
  nome: string;
}

export interface IDetalheCurso {
  id: number;
  faculdadeId: number;
  nome: string;
}

type TCursosComTotalCount = {
  data: IListagemCurso[];
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TCursosComTotalCount | Error> => {
  try {
    const urlRelativa = `/cursos?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&nome_like=${filter}`;

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

const getById = async (id: number): Promise<IDetalheCurso | Error> => {
  try {
    const { data } = await Api.get(`/cursos/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheCurso, 'id'>): Promise<number | Error> => {
  try {
    const { data } = await Api.post<IDetalheCurso>('/cursos', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheCurso): Promise<void | Error> => {
  try {
    await Api.put(`/cursos/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/cursos/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const CursosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
};
