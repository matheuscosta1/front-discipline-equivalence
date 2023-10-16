import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Grid, Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Typography, makeStyles } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../../shared/hooks';
import { FerramentasDaListagem } from '../../../shared/components';
import { Environment } from '../../../shared/environment';
import { LayoutBaseDePagina } from '../../../shared/layouts';
import { IListagemAlocacaoAnalisesProfessores, AlocacaoAnalisesProfessoresService } from '../../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import { EquivalenciaDisciplinaResponse, IDetalheRegistroEquivalencia, RegistroEquivalenciaService } from '../../../shared/services/api/relatorio_equivalencia/RegistroEquivalenciaService';
import { TableRows } from '@mui/icons-material';




export const ListagemRelatorioEquivalencia: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<EquivalenciaDisciplinaResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [identificador, setIdentificador] = useState<number | undefined>(/* valor inicial */);
  const [idDisciplinaOrigem, setIdDisciplinaOrigem] = useState<number | undefined>(/* valor inicial */);
  const [idDisciplinaDestino, setIdDisciplinaDestino] = useState<number | undefined>(/* valor inicial */);


  const { id = 'nova' } = useParams<'id'>();

  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '0');
  }, [searchParams]);


  console.log("Teste...")
  useEffect(() => {
    setIsLoading(true);
    debounce(() => {
      AlocacaoAnalisesProfessoresService.getByIdParaRelatorio(Number(id))
        .then((result) => {
          setIsLoading(false);
  
          if (result instanceof Error) {
            alert(result.message);
          } else {
            console.log(result);
  
            const { id, disciplinaOrigemId, disciplinaDestinoId } = result;
  
            if (id !== undefined && disciplinaOrigemId !== undefined && disciplinaDestinoId !== undefined) {
              console.log("Entrou aqui")
              const detalhe: IDetalheRegistroEquivalencia = {
                id: id,
                idDisciplinaOrigem: disciplinaOrigemId,
                idDisciplinaDestino: disciplinaDestinoId,
              };
  
              // Mova a chamada para RegistroEquivalenciaService.create para dentro deste bloco
              RegistroEquivalenciaService.create(detalhe)
                .then((result) => {
                  setIsLoading(false);
  
                  if (result instanceof Error) {
                    alert(result.message);
                  } else {
                    console.log(result);
                    setRows(result);
                    console.log("Rows",rows)
                  }
                });
            } else {
              alert('Algumas propriedades estão indefinidas.');
            }
          }
        });
    });
  }, [id]);
  

  return (
    <LayoutBaseDePagina
      titulo='Listagem de análises'
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca={false}
          textoDaBusca={busca}
          mostrarBotaoNovo={false}
          aoClicarEmNovo={() => navigate('/analises-professor/detalhe/nova')}
          aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '0' }, { replace: true })}
          inputBusca='Pesquisar por professor...'
        />
      }
    >
      <Grid container spacing={2} component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              {rows ? (
                <div>
                  <Typography variant="h5">Detalhes da Disciplina de Origem:</Typography>
                  <Typography>Faculdade de Origem: {rows.disciplinaOrigem.nomeFaculdade}</Typography>
                  <Typography>Curso de Origem: {rows.disciplinaOrigem.nomeCurso}</Typography>
                  <Typography>Disciplina Origem: {rows.disciplinaOrigem.nome}</Typography>
                  <Typography>Ementa: {rows.disciplinaOrigem.ementa}</Typography>
                  <Typography>Programa: {rows.disciplinaOrigem.programa}</Typography>
                  <Typography style={rows.cargaHorariaValida ? { color: 'green' } : { color: 'red' }}>Carga Horária: {rows.disciplinaOrigem.cargaHoraria}</Typography>
                  <Typography style={{ color: 'green' }}>Ementa Equivalente: {rows.ementaEquivalente}</Typography>
                  <Typography style={{ color: 'red' }}>
                    {rows.ementaNaoEquivalente && rows.ementaNaoEquivalente.length > 0
                      ? `Ementa não Equivalente: ${rows.ementaNaoEquivalente}`
                      : 'Ementa não Equivalente: Toda a ementa é equivalente'}
                  </Typography>
  
                  {/* Adicione mais informações conforme necessário */}
                </div>
              ) : (
                <LinearProgress />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              {rows ? (
                <div>
                  <Typography variant="h5">Detalhes da Disciplina de Origem:</Typography>
                  <Typography>Faculdade de Destino: {rows.disciplinaDestino.nomeFaculdade}</Typography>
                  <Typography>Curso de Destino: {rows.disciplinaDestino.nomeCurso}</Typography>
                  <Typography>Disciplina Destino: {rows.disciplinaDestino.nome}</Typography>
                  <Typography>Ementa: {rows.disciplinaDestino.ementa}</Typography>
                  <Typography>Programa: {rows.disciplinaDestino.programa}</Typography>
                  <Typography style={rows.cargaHorariaValida ? { color: 'green' } : { color: 'red' }}>Carga Horária: {rows.disciplinaDestino.cargaHoraria}</Typography>
                  <Typography style={{ color: 'green' }}>Ementa Equivalente: {rows.ementaEquivalente}</Typography>
                  <Typography style={{ color: 'red' }}>
                    {rows.ementaNaoEquivalente && rows.ementaNaoEquivalente.length > 0
                      ? `Ementa não Equivalente: ${rows.ementaNaoEquivalente}`
                      : 'Ementa não Equivalente: Toda a ementa é equivalente'}
                  </Typography>
  
                  {/* Adicione mais informações conforme necessário */}
                </div>
              ) : (
                <LinearProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent >
              <TextField
                label="Justificativa"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
              />
            </CardContent>

            <CardActions style={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary">
                Enviar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      
      
    </LayoutBaseDePagina>
  );
  
};
