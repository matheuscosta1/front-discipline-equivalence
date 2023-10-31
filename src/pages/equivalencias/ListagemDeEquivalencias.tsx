import React, { useEffect, useMemo, useState } from 'react';
import { IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Select, MenuItem } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IListagemRegistroEquivalencia, RegistroEquivalenciaService } from '../../shared/services/api/registro_equivalencia/RegistroEquivalenciaService';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';
import { Environment } from '../../shared/environment';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

export const ListagemDeEquivalencias: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemRegistroEquivalencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '0');
  }, [searchParams]);

  const [filtroEquivalente, setFiltroEquivalente] = useState('todos'); // Pode ser 'todos', 'equivalente' ou 'nao_equivalente'

  const filtrarEquivalencias = (equivalente: string) => {
    if (filtroEquivalente === 'todos') {
      return true; // Mostrar todos os registros
    } else if (filtroEquivalente === 'equivalente') {
      return equivalente === 'EQUIVALENTE';
    } else if (filtroEquivalente === 'nao_equivalente') {
      return equivalente === 'NÃO EQUIVALENTE';
    }
    return true;
  };

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      RegistroEquivalenciaService.getAll(pagina, busca)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
          } else {
            setTotalCount(result.totalCount);
            setRows(result.content);
          }
        });
    });
  }, [busca, pagina, filtroEquivalente]);

  const [sortOrder, setSortOrder] = useState('asc');
  const [sortOrderStatus, setSortOrderStatus] = useState('asc');

  const handleSortClick = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  
    const sortedRows = [...rows];
    if (newSortOrder === 'asc') {
      sortedRows.sort((a, b) => (a.dataCriacao > b.dataCriacao ? 1 : -1));
    } else {
      sortedRows.sort((a, b) => (a.dataCriacao < b.dataCriacao ? 1 : -1));
    }
  
    setSortOrder(newSortOrder);
    setRows(sortedRows);
  };

  const handleSortStatusClick = () => {
    const newSortOrder = sortOrderStatus === 'asc' ? 'desc' : 'asc';
  
    const sortedRows = [...rows];
    sortedRows.sort((a, b) => {
      if (a.equivalente === b.equivalente) {
        return 0;
      }
      if (newSortOrder === 'asc') {
        return a.equivalente ? -1 : 1; // 1 significa "Não Equivalente", -1 significa "Equivalente"
      } else {
        return a.equivalente ? 1 : -1; // -1 significa "Equivalente", 1 significa "Não Equivalente"
      }
    });
  
    setSortOrderStatus(newSortOrder);
    setRows(sortedRows);
  };

  return (
      <LayoutBaseDePagina
        titulo='Equivalências'
        barraDeFerramentas={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, marginLeft: '8px' }}> {/* Barra de pesquisa ocupa boa parte da tela */}
              <FerramentasDaListagem
                mostrarInputBusca
                textoDaBusca={busca}
                mostrarBotaoNovo={false}
                aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
                inputBusca="Pesquisar por código..."
              />
            </div>
            <div style={{ marginRight: '8px' }}> {/* Filtro de seleção à direita */}
              <Select
                value={filtroEquivalente}
                onChange={(event) => setFiltroEquivalente(event.target.value as string)}
                displayEmpty
                style={{ marginLeft: '8px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="equivalente">Equivalentes</MenuItem>
                <MenuItem value="nao_equivalente">Não Equivalentes</MenuItem>
              </Select>
            </div>
          </div>
        }
      >
      <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculdade Origem</TableCell>
              <TableCell>Curso Origem</TableCell>
              <TableCell>Código Disciplina Origem</TableCell>
              <TableCell>Faculdade Destino</TableCell>
              <TableCell>Curso Destino</TableCell>
              <TableCell>Código Disciplina Destino</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Justificativa</TableCell>
              <TableCell>Data da Análise
                <IconButton size="small" onClick={handleSortClick}>
                  {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small"/>}
                </IconButton>
              </TableCell>
              <TableCell>Status
                <IconButton size="small" onClick={handleSortStatusClick}>
                  {sortOrderStatus === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small"/>}
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .filter((row) => filtrarEquivalencias(row.equivalente))
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.faculdadeOrigem}</TableCell>
                  <TableCell>{row.cursoOrigem}</TableCell>
                  <TableCell>{row.codigoDisciplinaOrigem}</TableCell>
                  <TableCell>{row.faculdadeDestino}</TableCell>
                  <TableCell>{row.cursoDestino}</TableCell>
                  <TableCell>{row.codigoDisciplinaDestino}</TableCell>
                  <TableCell>{row.nomeProfessor}</TableCell>
                  <TableCell>{row.justificativa}</TableCell>
                  <TableCell>{row.dataCriacao}</TableCell>
                  <TableCell>
                    <span style={{ color: row.equivalente === 'EQUIVALENTE' ? 'green' : 'darkred' }}>
                      {row.equivalente}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>

          {totalCount === 0 && !isLoading && (
            <caption>{Environment.LISTAGEM_VAZIA}</caption>
          )}

          <TableFooter>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <LinearProgress variant='indeterminate' />
                </TableCell>
              </TableRow>
            )}
            {totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Pagination
                    page={pagina + 1}
                    count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS + 1)}
                    onChange={(_, newPage) => setSearchParams({ busca, pagina: (newPage - 1).toString() }, { replace: true })}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>
      </TableContainer>
    </LayoutBaseDePagina>
  );
};
