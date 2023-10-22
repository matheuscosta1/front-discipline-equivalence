import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../shared/hooks';
import { FerramentasDaListagem } from '../../shared/components';
import { Environment } from '../../shared/environment';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IListagemAlocacaoAnalisesProfessores, AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import jwt_decode from 'jwt-decode';


interface DecodedToken {
  sub: string;
  exp: number;
  roles: string[]; // Adicione a propriedade 'roles' com o tipo apropriado
}

function getEmailDoUsuarioLogado() {
  // Obtenha o token JWT armazenado no localStorage
  const token = localStorage.getItem('APP_ACCESS_TOKEN');

  // Verifique se o token existe
  if (token) {
    try {
      // Decodifique o token JWT e atribua o tipo DecodedToken ao resultado
      const decodedToken: DecodedToken = jwt_decode(token);

      return decodedToken.sub;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
    }
  }

  // Se não houver token ou a role 'ROLE_PROFESSOR' não estiver presente, retorne null ou outra indicação apropriada
  return '';
}



export const ListagemDeAnalisesDoProfessor: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemAlocacaoAnalisesProfessores[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);


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
            console.log(result);

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

  return (
    <LayoutBaseDePagina
      titulo='Análises de equivalência'
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          textoBotaoNovo='Nova'
          aoClicarEmNovo={() => navigate('/analises-professor/detalhe/nova')}
          aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
          inputBusca = 'Pesquisar por professor...'
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
              <TableCell>Data máxima</TableCell>
              <TableCell>Status</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell>
                  <IconButton size="small" onClick={() => navigate(`/analises-professor/detalhe/${row.id}`)}>
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
                <TableCell>{row.dataMaxima}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
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
      </TableContainer>
    </LayoutBaseDePagina>
  );
};
