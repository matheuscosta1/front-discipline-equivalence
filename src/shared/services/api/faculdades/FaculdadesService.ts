import { Environment } from '../../../environment';
import { Api } from '../axios-config';


type Data = {
  content:  IListagemFaculdade
  totalElements: number
}

export interface IListagemFaculdade {
  id: number;
  nome: string;
  data: Data;
}

export interface IDetalheFaculdade {
  id: number;
  nome: string;
}

type TFaculdadesComTotalCount = {
  data: IListagemFaculdade[];
  content: IListagemFaculdade[];
  totalCount: number;
}

const getAll = async (page = 0, filter = ''): Promise<TFaculdadesComTotalCount | Error> => {
  try {

    console.log(page);
    const urlRelativa = `/faculdades?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS}&nome=${filter}`;

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

const getAllForAutoComplete = async (page = 0, filter = ''): Promise<TFaculdadesComTotalCount | Error> => {
  try {

    console.log(page);
    const urlRelativa = `/faculdades?pagina=${page}&paginas=${Environment.LIMITE_DE_LINHAS_ILIMITADO}&nome=${filter}`;

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
    const { data, status } = await Api.post<IDetalheFaculdade>('/faculdades', dados);

    if (status === 200) {
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
  getAllForAutoComplete
};
