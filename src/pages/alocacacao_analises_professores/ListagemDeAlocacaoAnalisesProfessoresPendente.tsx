import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Icon, IconButton, LinearProgress, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IListagemAlocacaoAnalisesProfessores, AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';
import { Environment } from '../../shared/environment';
import { differenceInDays, parse} from 'date-fns';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

const dataAtual = new Date();

export const ListagemDeAlocacaoAnalisesProfessoresPendente: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemAlocacaoAnalisesProfessores[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // Pode ser 'todos', 'pendente' ou 'analisado'

  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '0');
  }, [searchParams]);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      AlocacaoAnalisesProfessoresService.getAll(pagina, busca)
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
  }, [busca, pagina]);

  const handleDelete = (id: number) => {
    if (window.confirm('Realmente deseja apagar?')) {
      AlocacaoAnalisesProfessoresService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            alert(result.message);
          } else {
            setRows(oldRows => [
              ...oldRows.filter(oldRow => oldRow.id !== id),
            ]);
            alert('Registro apagado com sucesso!');
          }
        });
    }
  };

  const filteredRows = rows.filter(row => {
    return row.status === 'PENDENTE';
  });

  const [sortOrder, setSortOrder] = useState('asc');

  const handleSortClick = () => {
    // Alterna a ordem de classificação ao clicar no botão de ordenação
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  
    // Ordene os dados com base no novo sortOrder
    const sortedRows = [...filteredRows];
    if (newSortOrder === 'asc') {
      sortedRows.sort((a, b) => (a.dataMaxima > b.dataMaxima ? 1 : -1));
    } else {
      sortedRows.sort((a, b) => (a.dataMaxima < b.dataMaxima ? 1 : -1));
    }
  
    setSortOrder(newSortOrder);
    setRows(sortedRows);
  };

  return (
    <LayoutBaseDePagina
      titulo='Análises de equivalência pendentes'
      barraDeFerramentas={
        <FerramentasDaListagem
              mostrarInputBusca
              textoDaBusca={busca}
              textoBotaoNovo='Nova'
              aoClicarEmNovo={() => navigate('/analises/detalhe/nova')}
              aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
              inputBusca="Pesquisar por código..."
            />
      }
    >
      <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={100}>Ações</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Faculdade Origem</TableCell>
              <TableCell>Curso Origem</TableCell>
              <TableCell>Disciplina Origem</TableCell>
              <TableCell>Faculdade Destino</TableCell>
              <TableCell>Curso Destino</TableCell>
              <TableCell>Disciplina Destino</TableCell>
              <TableCell>Data máxima
                <IconButton size="small" onClick={handleSortClick}>
                  {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small"/>}
                </IconButton>
              </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map(row => {
              const dataMaximaDate = parse(row.dataMaxima, 'dd/MM/yyyy', new Date());

              const diasRestantes = differenceInDays(dataMaximaDate, dataAtual);

              let corDataMaxima = '';

              if (diasRestantes <= 0) {
                corDataMaxima = "hsl(0, 100%, 60%)"; 
              } else if (diasRestantes === 1) {
                corDataMaxima = 'coral'; 
              } else if (diasRestantes <= 7) {
                corDataMaxima = 'orange'; 
              }

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(row.id)}>
                      <Icon>delete</Icon>
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/analises/detalhe/${row.id}`)}>
                      <Icon>edit</Icon>
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.nomeProfessor}</TableCell>
                  <TableCell>{row.nomeFaculdadeOrigem}</TableCell>
                  <TableCell>{row.nomeCursoOrigem}</TableCell>
                  <TableCell>{row.nomeDisciplinaOrigem}</TableCell>
                  <TableCell>{row.nomeFaculdadeDestino}</TableCell>
                  <TableCell>{row.nomeCursoDestino}</TableCell>
                  <TableCell>{row.nomeDisciplinaDestino}</TableCell>
                  <TableCell style={{ color: corDataMaxima }}> 
                    {row.dataMaxima} 
                  </TableCell>
                  <TableCell style={{ color: row.status === 'PENDENTE' ? 'royalblue' : row.status === 'MUDANÇA EMENTA' ? 'orange' : 'green'}}>
                    {row.status}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {totalCount === 0 && !isLoading && (
            <caption>{Environment.LISTAGEM_VAZIA}</caption>
          )}

          <TableFooter>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <LinearProgress variant='indeterminate' />
                </TableCell>
              </TableRow>
            )}
            {(totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS) && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Pagination
                    page={pagina}
                    count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
                    onChange={(_, newPage) => setSearchParams({ busca, pagina: newPage.toString() }, { replace: true })}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>
        <Dialog open={isErrorModalOpen} onClose={closeErrorModal}>
        <DialogTitle>
          Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorModal} color="primary" autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isSuccessModalOpen} onClose={closeSuccessModal}>
        <DialogTitle>
        Cadastro realizado com sucesso!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{successMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSuccessModal} color="primary" autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      </TableContainer>
      
    </LayoutBaseDePagina>
  );
};
