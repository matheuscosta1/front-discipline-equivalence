import { StringLocale } from 'yup/lib/locale';
import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemDisciplina {
  id: number;
  nome: string;
  codigoOrigem: string;
  ementa: string;
  programa: string;
  cargaHoraria: number;
  faculdadeId: number;
  cursoId: number;
}

export interface IDetalheDisciplina {
  id: number;
  nome: string;
  codigoOrigem: string;
  ementa: string;
  programa: string;
  cargaHoraria: number;
  faculdadeId: number;
  cursoId: number;
}

type TDisciplinasComTotalCount = {
  data: IListagemDisciplina[];
  content: IListagemDisciplina[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TDisciplinasComTotalCount | Error> => {
  try {
    const urlRelativa = `/disciplinas?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&nome=${filter}`;

    const { data, headers } = await Api.get(urlRelativa);

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

const getAllDisciplinesByFaculdadeIdAndCursoId = async (page = 1, filter = '', faculdadeId: any, cursoId: any): Promise<TDisciplinasComTotalCount | Error> => {
  try {
    console.log("Faculdade: ", faculdadeId);
    console.log("Curso: ", cursoId);
    const urlRelativa = `/disciplinas?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS_ILIMITADO}&faculdadeId=${faculdadeId}&cursoId=${cursoId}`;

    const { data, headers } = await Api.get(urlRelativa);

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

const getById = async (id: number): Promise<IDetalheDisciplina | Error> => {
  try {
    const { data } = await Api.get(`/disciplinas/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheDisciplina, 'id'>): Promise<number | Error> => {
  try {
    const { data } = await Api.post<IDetalheDisciplina>('/disciplinas', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheDisciplina): Promise<void | Error> => {
  try {
    await Api.put(`/disciplinas/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/disciplinas/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const DisciplinasService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getAllDisciplinesByFaculdadeIdAndCursoId,
};
