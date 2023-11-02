import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Icon, IconButton, LinearProgress, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../shared/hooks';
import { FerramentasDaListagem } from '../../shared/components';
import { Environment } from '../../shared/environment';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IListagemAlocacaoAnalisesProfessores, AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import jwt_decode from 'jwt-decode';
import { differenceInDays, parse} from 'date-fns';

const dataAtual = new Date();

interface DecodedToken {
  sub: string;
  exp: number;
  roles: string[]; 
}

function getEmailDoUsuarioLogado() {
  
  const token = localStorage.getItem('APP_ACCESS_TOKEN');

  
  if (token) {
    try {
      
      const decodedToken: DecodedToken = jwt_decode(token);

      return decodedToken.sub;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
    }
  }

  
  return '';
}



export const ListagemDeAnalisesDoProfessor: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemAlocacaoAnalisesProfessores[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState('todos'); 


  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '0');
  }, [searchParams]);


  useEffect(() => {
    setIsLoading(true);
    const email = getEmailDoUsuarioLogado();
    debounce(() => {
      AlocacaoAnalisesProfessoresService.getAllByProfessorLogado(pagina, busca,  email)
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
    if (filtroStatus === 'todos') {
      return true;
    } else if (filtroStatus === 'pendente') {
      return row.status === 'PENDENTE';
    } else if (filtroStatus === 'analisado') {
      return row.status === 'ANALISADO';
    }
    return true;
  });

  return (
    <LayoutBaseDePagina
      titulo='Histórico de análises de equivalência'
      barraDeFerramentas={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, marginLeft: '0px' }}> 
            <FerramentasDaListagem
              mostrarInputBusca
              textoDaBusca={busca}
              textoBotaoNovo='Nova'
              mostrarBotaoNovo={false}
              aoClicarEmNovo={() => navigate('/analises/detalhe/nova')}
              aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
              inputBusca="Pesquisar por código..."
            />
          </div>
          <div style={{ marginRight: '8px' }}> 
            <Select
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value as string)}
              displayEmpty
              style={{ marginLeft: '8px' }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="analisado">Analisado</MenuItem>
            </Select>
          </div>
        </div>
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
              <TableCell>Data máxima</TableCell>
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
                <TableRow 
                  key={row.id}
                  style={{ cursor: row.status === 'PENDENTE' ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (row.status === 'PENDENTE') {
                      navigate(`/analises-professor/detalhe/${row.id}`);
                    } else {
                      return; 
                    }
                  }}
                >
                  <TableCell>
                  <IconButton
                        size="small"
                        onClick={() => {
                          if (row.status === 'PENDENTE') {
                            navigate(`/analises-professor/detalhe/${row.id}`);
                          } else {
                            return; 
                          }
                        }}
                        disabled={row.status !== 'PENDENTE'}
                      >
                        <Icon>build</Icon>
                  </IconButton>
                  </TableCell>
                  <TableCell>{row.nomeProfessor}</TableCell>
                  <TableCell>{row.nomeFaculdadeOrigem}</TableCell>
                  <TableCell>{row.nomeCursoOrigem}</TableCell>
                  <TableCell>{row.nomeDisciplinaOrigem}</TableCell>
                  <TableCell>{row.nomeFaculdadeDestino}</TableCell>
                  <TableCell>{row.nomeCursoDestino}</TableCell>
                  <TableCell>{row.nomeDisciplinaDestino}</TableCell>
                  <TableCell style={{ color: corDataMaxima }}> {row.dataMaxima} </TableCell>
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
            {totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS && (
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
      </TableContainer>
    </LayoutBaseDePagina>
  );
};
