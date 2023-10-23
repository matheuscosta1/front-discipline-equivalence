import { useEffect, useMemo, useState } from 'react';
import { Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IListagemRegistroEquivalencia, RegistroEquivalenciaService, } from '../../shared/services/api/registro_equivalencia/RegistroEquivalenciaService';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';
import { Environment } from '../../shared/environment';


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


  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      RegistroEquivalenciaService.getAll(pagina, busca)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
          } else {
            console.log("Data equivalencias: ", result.data);
            console.log("Total Count equivalencias: ", result.totalCount);

            setTotalCount(result.totalCount);
            setRows(result.content);
          }
        });
    });
  }, [busca, pagina]);

  return (
    <LayoutBaseDePagina
      titulo='Equivalências'
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          mostrarBotaoNovo={false}
          aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
          inputBusca = 'Pesquisar por código...'
        />
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
              <TableCell>Data da Análise</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.faculdadeOrigem}</TableCell>
                <TableCell>{row.cursoOrigem}</TableCell>
                <TableCell>{row.codigoDisciplinaOrigem}</TableCell>
                <TableCell>{row.faculdadeDestino}</TableCell>
                <TableCell>{row.cursoDestino}</TableCell>
                <TableCell>{row.codigoDisciplinaDestino}</TableCell>
                <TableCell>{row.nomeProfessor}</TableCell>
                <TableCell>{row.dataCriacao}</TableCell>
                <TableCell>{row.equivalente}</TableCell>
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
                    page={pagina+1}
                    count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS+1)}
                    onChange={(_, newPage) => setSearchParams({ busca, pagina: (newPage-1).toString() }, { replace: true })}
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
