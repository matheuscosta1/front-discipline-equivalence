import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemFaculdade {
  id: number;
  nome: string;
}

export interface IDetalheFaculdade {
  id: number;
  nome: string;
}

type TFaculdadesComTotalCount = {
  data: IListagemFaculdade[];
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TFaculdadesComTotalCount | Error> => {
  try {
    const urlRelativa = `/faculdades?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&nome_like=${filter}`;

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

const getById = async (id: number): Promise<IDetalheFaculdade | Error> => {
  try {
    const { data } = await Api.get(`/faculdades/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheFaculdade, 'id'>): Promise<number | Error> => {
  try {
    const { data } = await Api.post<IDetalheFaculdade>('/faculdades', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheFaculdade): Promise<void | Error> => {
  try {
    await Api.put(`/faculdades/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/faculdades/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const FaculdadesService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
};
