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
  content: IListagemCurso[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TCursosComTotalCount | Error> => {
  try {

    console.log(page);
    const urlRelativa = `/cursos?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&nome=${filter}`;

    console.log(urlRelativa);
    
    const { data, headers } = await Api.get(urlRelativa);

    console.log("Data from axios: ", data);

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


const getByFaculdadeId = async (page = 0, filter = '', faculdadeId: any): Promise<TCursosComTotalCount | Error> => {
  try {
    const urlRelativa = `/cursos?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS_ILIMITADO}&faculdadeId=${faculdadeId}`;

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
  getByFaculdadeId
};
