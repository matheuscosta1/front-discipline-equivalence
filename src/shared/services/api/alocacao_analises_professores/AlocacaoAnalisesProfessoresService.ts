import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemAlocacaoAnalisesProfessores {
  id: number;
  nome: string;
  faculdadeId: number;
  cursoId: number;
  nomeCurso: number;
  nomeFaculdade: number;
}

export interface IDetalheAlocacaoAnalisesProfessores {
  id: number;
  faculdadeOrigemId: number;
  cursoOrigemId: number;
  disciplinaOrigemId: number;
  faculdadeDestinoId: number;
  cursoDestinoId: number;
  disciplinaDestinoId: number;
  professorId: number;
  dataMaxima: string;
}


type TRegistroAlocacaoAnalisesProfessoresComTotalCount = {
  data: IListagemAlocacaoAnalisesProfessores[];
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TRegistroAlocacaoAnalisesProfessoresComTotalCount | Error> => {
  try {
    const urlRelativa = `/alocacao-analises-professores?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&nome_like=${filter}`;

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

const getById = async (id: number): Promise<IDetalheAlocacaoAnalisesProfessores | Error> => {
  try {
    const { data } = await Api.get(`/alocacao-analises-professores/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheAlocacaoAnalisesProfessores, 'id'>): Promise<number | Error> => {
  try {
    const { data, status } = await Api.post<IDetalheAlocacaoAnalisesProfessores>('/alocacao-analises-professores', dados);

    if (status === 200) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheAlocacaoAnalisesProfessores): Promise<void | Error> => {
  try {
    await Api.put(`/alocacao-analises-professores/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};
 
const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/alocacao-analises-professores/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const AlocacaoAnalisesProfessoresService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
};
