import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardActions, CardContent, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Typography, makeStyles } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../shared/hooks';
import { FerramentasDaListagem } from '../../shared/components';
import { Environment } from '../../shared/environment';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IListagemAlocacaoAnalisesProfessores, AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import { EquivalenciaDisciplinaResponse, IDetalheRelatorioEquivalencia, RelatorioEquivalenciaService } from '../../shared/services/api/relatorio_equivalencia/RelatorioEquivalenciaService';
import { ErrorOutline, TableRows } from '@mui/icons-material';
import { IDetalheRegistroEquivalencia, RegistroEquivalenciaService } from '../../shared/services/api/registro_equivalencia/RegistroEquivalenciaService';




export const ListagemRelatorioEquivalencia: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<EquivalenciaDisciplinaResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [justificativa, setJustificativa] = useState('');
  const [equivalente, setEquivalente] = useState(false);

  const handleCheckboxChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
    setEquivalente(e.target.checked); 
  };

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

  const handleSubmit = () => {
    setIsLoading(true);

    const detalhe: IDetalheRegistroEquivalencia = {
      id: Number(id),
      disciplinaOrigemId: rows!!.disciplinaOrigem.id,
      disciplinaDestinoId: rows!!.disciplinaDestino.id,
      faculdadeOrigemId: rows!!.disciplinaOrigem.faculdadeId,
      faculdadeDestinoId: rows!!.disciplinaDestino.faculdadeId,
      justificativa: justificativa,
      equivalente: equivalente,
    };
    RegistroEquivalenciaService.create(detalhe)
      .then((result) => {
        if (result instanceof Error) {
          if(result.message.includes('422')) {
            setIsLoading(false);
            setErrorMessage('Equivalência já foi registrada.');
            setIsErrorModalOpen(true);
          } else {
            alert(result.message);
          }
        } else {
          setSuccessMessage('Equivalência cadastrada com sucesso.');
          setIsSuccessModalOpen(true);          
          
          setTimeout(() => {
            
            setIsLoading(false);
            navigate('/analises-professor');
          }, 2000);
        }
      });
  };

  const { id = 'nova' } = useParams<'id'>();

  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '0');
  }, [searchParams]);


  useEffect(() => {
    setIsLoading(true);
    debounce(() => {
      AlocacaoAnalisesProfessoresService.getByIdParaRelatorio(Number(id))
        .then((result) => {
          setIsLoading(false);
  
          if (result instanceof Error) {
            alert(result.message);
          } else {
            
  
            const { id, disciplinaOrigemId, disciplinaDestinoId } = result;
  
            if (id !== undefined && disciplinaOrigemId !== undefined && disciplinaDestinoId !== undefined) {
              const detalhe: IDetalheRelatorioEquivalencia = {
                id: id,
                idDisciplinaOrigem: disciplinaOrigemId,
                idDisciplinaDestino: disciplinaDestinoId,
              };
  
              // Mova a chamada para RegistroEquivalenciaService.create para dentro deste bloco
              RelatorioEquivalenciaService.create(detalhe)
                .then((result) => {
                  setIsLoading(false);

                  if (result instanceof Error) {
                  } else {
                    
                    setRows(result);
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
      titulo='Análises'
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca={false}
          textoDaBusca={busca}
          mostrarBotaoNovo={false}
          mostrarBotaoVoltar={true}
          aoClicarEmNovo={() => navigate('/analises-professor/detalhe/nova')}
          aoClicarEmVoltar={() => navigate('/analises-professor')}
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
                  
                  <Typography>Faculdade: {rows.disciplinaOrigem.nomeFaculdade}</Typography>
                  <Typography>Curso: {rows.disciplinaOrigem.nomeCurso}</Typography>
                  <Typography>Disciplina: {rows.disciplinaOrigem.nome}</Typography>
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
                  <Typography variant="h5">Detalhes da Disciplina de Destino:</Typography>
                  <Typography>Faculdade: {rows.disciplinaDestino.nomeFaculdade}</Typography>
                  <Typography>Curso: {rows.disciplinaDestino.nomeCurso}</Typography>
                  <Typography>Disciplina: {rows.disciplinaDestino.nome}</Typography>
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
            <CardContent>
              <Typography variant="h6">Parecer final: </Typography>
            </CardContent>
            <CardContent>
              <TextField
                label="Justificativa de equivalência"
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                onChange={e => setJustificativa(e.target.value)}
              />
            </CardContent>
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={equivalente}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Equivalente"
              />
            </CardContent>
            <CardActions style={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
              >
                Enviar
              </Button>
            </CardActions>
          </Card>
          {isLoading && (
              <Grid item>
                <LinearProgress variant='indeterminate' />
              </Grid>
            )}
        </Grid>
        <Dialog open={isErrorModalOpen} onClose={closeErrorModal}>
          <DialogTitle>
            Erro
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
            <Button onClick={closeSuccessModal}  color="primary" autoFocus>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
      
    </LayoutBaseDePagina>
  );
  
};
