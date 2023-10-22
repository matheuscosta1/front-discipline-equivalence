import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IDisciplineResponse {
  id: number;
  nome: string;
  codigoOrigem: string;
  ementa: string;
  programa: string;
  cargaHoraria: string;
  faculdadeId: number;
  cursoId: number;
  nomeFaculdade: string;
  nomeCurso: string;
}

export interface IMenuEquivalenceResponse {
  ementaEquivalente: string[];
  ementaNaoEquivalente: string[];
}

export interface EquivalenciaDisciplinaResponse {
  disciplinaOrigem: IDisciplineResponse,
  disciplinaDestino: IDisciplineResponse,
  cargaHorariaValida: boolean,
  equivalenciaEmenta: IMenuEquivalenceResponse,
  percentualEquivalencia: number,
  ementaEquivalente: string,
  ementaNaoEquivalente: string
}


export interface IListagemRelatorioEquivalencia {
  id: number;
  cursoOrigem: string;
  cursoDestino: string;
  professorAnalisador: string;
  status: string;
}

export interface IDetalheRelatorioEquivalencia {
  id: number;
  idDisciplinaOrigem: number;
  idDisciplinaDestino: number;
}


type TRelatorioEquivalenciaComTotalCount = {
  data: IListagemRelatorioEquivalencia[];
  totalCount: number;
  content: EquivalenciaDisciplinaResponse
}

const getAll = async (page = 1, filter = ''): Promise<TRelatorioEquivalenciaComTotalCount | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const urlRelativa = `/relatorio-equivalencia?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&cursoOrigem_like=${filter}`;

    const { data, headers } = await Api.get(urlRelativa, headersConfig);

    if (data) {
      return {
        data,
        totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
        content: data.content
      };
    }

    return new Error('Erro ao listar os registros.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
  }
};

const getById = async (id: number): Promise<IDetalheRelatorioEquivalencia | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data } = await Api.get(`/relatorio-equivalencia/${id}`, headersConfig);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheRelatorioEquivalencia, 'id'>): Promise<EquivalenciaDisciplinaResponse | Error> => {
  const headersConfig = {
    headers: getAuthorizationHeaders(),
  };
  try {
    const { data, status } = await Api.post<EquivalenciaDisciplinaResponse>('/relatorio-equivalencia', dados, headersConfig);

    if (status === 200) {
      return data;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
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

export const RelatorioEquivalenciaService = {
  getAll,
  create,
  getById
};
