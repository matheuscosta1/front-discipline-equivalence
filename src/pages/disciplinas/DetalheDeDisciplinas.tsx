import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Icon, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { DisciplinasService } from '../../shared/services/api/disciplinas/DisciplinasService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdade } from './components/AutoCompleteFaculdade';
import { AutoCompleteCurso } from './components/AutoCompleteCurso';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IDetalheFaculdade, FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { CursosService, IDetalheCurso } from '../../shared/services/api/cursos/CursosService';

interface IFormData {
  nome: string;
  codigoOrigem: string;
  ementa: string;
  programa: string;
  cargaHoraria: number;
  faculdadeId: number;
  cursoId: number;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  nome: yup.string().required().min(3),
  codigoOrigem: yup.string().required().min(3),
  ementa: yup.string().required().min(3),
  programa: yup.string().required().min(3),
  cargaHoraria: yup.number().required().min(2),
  faculdadeId: yup.number().required(),
  cursoId: yup.number().required()
});

export const DetalheDeDisciplinas: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [ementa, setEmenta] = useState('');
  const [programa, setPrograma] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [codigoOrigem, setCodigoOrigem] = useState('');

  const [faculdadeId, setFaculdadeId] = useState<number | undefined>(/* valor inicial */);

  const handleFaculdadeIdChange = (novoFaculdadeId: number | undefined) => {
    setFaculdadeId(novoFaculdadeId);
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

  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] = useState(false);
  
  const closeUpdateSuccessModal = () => {
    setIsUpdateSuccessModalOpen(false);
  };

  const [isConfirmationSaveModalOpen, setSaveConfirmationModalOpen] = useState(false);

  const openSaveConfirmationModal = () => {
    setSaveConfirmationModalOpen(true);
  };

  const closeSaveConfirmationModal = () => {
    setSaveConfirmationModalOpen(false);
  };

  const handleSaveConfirmationAndSubmit = () => {
    closeSaveConfirmationModal();
    save();
  };

  const [isSaveAndCloseConfirmationModalOpen, setSaveAndCloseConfirmationModalOpen] = useState(false);

  const openSaveAndCloseConfirmationModal = () => {
    setSaveAndCloseConfirmationModalOpen(true);
  };

  const closeSaveAndCloseConfirmationModal = () => {
    setSaveAndCloseConfirmationModalOpen(false);
  };

  const handleSaveAndCloseConfirmationAndSubmit = () => {
    closeSaveAndCloseConfirmationModal();
    saveAndClose();
  };

  const [isFaculdadeModalOpen, setIsFaculdadeModalOpen] = useState(false);
  const [novaFaculdade, setNovaFaculdade] = useState('');

  const handleOpenFaculdadeModal = () => {
    setIsFaculdadeModalOpen(true);
  };

  const handleCloseFaculdadeModal = () => {
    setIsFaculdadeModalOpen(false);
  };

  const [isCursoModalOpen, setIsCursoModalOpen] = useState(false);
  const [novoCurso, setNovoCurso] = useState('');

  const handleOpenCursoModal = () => {
    setIsCursoModalOpen(true);
  };

  const handleCloseCursoModal = () => {
    setIsCursoModalOpen(false);
  };

  type TAutoCompleteOption = {
    id: number;
    label: string;
  }

  const initialFaculdadeValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const initialCursoValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const [selectedFaculdade, setSelectedFaculdade] = useState<TAutoCompleteOption | undefined>(initialFaculdadeValue);

  const handleNovaFaculdadeIdChange = (novaFaculdade: TAutoCompleteOption | undefined) => {
    setSelectedFaculdade(novaFaculdade);
  };

  const [selectedCurso, setSelectedCurso] = useState<TAutoCompleteOption | undefined>(initialCursoValue);

  const handleNovoCursoIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedCurso(novoCurso);
  };

  const handleSaveFaculdade = () => {
    
    

    const detalhe: IDetalheFaculdade = {
      id: Number(id),
      nome: novaFaculdade
    };
    setIsLoading(true);

    FaculdadesService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Faculdade já foi registrada.');
                      setIsErrorModalOpen(true);

                      handleCloseFaculdadeModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);

                      handleCloseFaculdadeModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    setTimeout(() => {
                      setFaculdadeId(Number(result.id))
                      handleNovaFaculdadeIdChange(detalhe)

                      setIsLoading(false);

                      setSuccessMessage('Faculdade registrada com sucesso.');
                      setIsSuccessModalOpen(true); 

                      handleCloseFaculdadeModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveCurso = () => {
    const detalhe: IDetalheCurso = {
      id: Number(id),
      faculdadeId: Number(selectedFaculdade!!.id),
      nome: novoCurso
    };
    setIsLoading(true);

    CursosService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Curso já foi registrado.');
                      setIsErrorModalOpen(true);
                      handleCloseCursoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseCursoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    handleNovoCursoIdChange(detalhe)

                    setTimeout(() => {
                      setIsLoading(false);

                      setSuccessMessage('Curso registrado com sucesso.');
                      setIsSuccessModalOpen(true); 

                      handleCloseCursoModal();
                    }, 2000);
                  }
                });
  };


  

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      DisciplinasService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/disciplinas');
          } else {
            const detalhe: TAutoCompleteOption = {
              id: Number(result.faculdadeId),
              label: result.nomeFaculdade
            };
            handleNovaFaculdadeIdChange(detalhe)
            setNome(result.nome);
            setEmenta(result.ementa);
            setPrograma(result.programa);
            setCodigoOrigem(result.codigoOrigem);
            formRef.current?.setData(result);
          }
        });
    } else {
      formRef.current?.setData({
        nome: '',
        codigoOrigem: '',
        ementa: '',
        programa: '',
        cargaHoraria: '',
        faculdadeId: undefined,
        cursoId: undefined,
      });
    }
  }, [id]);


  const handleSave = (dados: IFormData) => {

    formValidationSchema.validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'nova') {

          DisciplinasService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                if(result.message.includes('422')) {
                  setErrorMessage('Disciplina já registrada.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Disciplina cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/disciplinas');
                } else {
                  setSuccessMessage('Disciplina cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate(`/disciplinas/detalhe/${result.id}`);
                }
              }
            });
        } else {
          DisciplinasService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                setSuccessMessage('Disciplina atualizada com sucesso.');
                setIsUpdateSuccessModalOpen(true);
                if (isSaveAndClose()) {
                  navigate('/disciplinas');
                }
              }
            });
        }
      })
      .catch((errors: yup.ValidationError) => {
        const validationErrors: IVFormErrors = {};

        errors.inner.forEach(error => {
          if (!error.path) return;

          validationErrors[error.path] = error.message;
        });
        
        formRef.current?.setErrors(validationErrors);
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Realmente deseja apagar?')) {
      DisciplinasService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            if(result.message.includes('422')) {
              setErrorMessage('Não foi possível deletar a análise de equivalência.');
              setIsErrorModalOpen(true);
            } else {
              alert(result.message);
            }
          } else {
            setSuccessMessage('Registro apagado com sucesso.');
            setIsSuccessModalOpen(true); 
            navigate('/disciplinas');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova disciplina' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar={false}
          mostrarBotaoSalvar={false}
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={false}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/disciplinas')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/disciplinas/detalhe/nova')}
        />
      }
    >
    <Box  margin={2} display="flex" justifyContent="center">
      <Box style={{ width: '100%' }}>
        <Paper variant="outlined" style={{ display: 'flex', justifyContent: 'center' }}>
          <VForm ref={formRef} onSubmit={handleSave}>
            <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined" style={{ border: 'none' }}>

              <Grid container direction="column" padding={2} spacing={2}>

                {isLoading && (
                  <Grid item>
                    <LinearProgress variant='indeterminate' />
                  </Grid>
                )}

                <Grid item>
                  <Typography variant='h6'>Disciplina</Typography>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      name='nome'
                      disabled={isLoading}
                      label='Nome'
                      onChange={e => setNome(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      name='codigoOrigem'
                      disabled={isLoading}
                      label='Código Disciplina'
                      onChange={e => setCodigoOrigem(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      multiline
                      rows={4}
                      name='ementa'
                      disabled={isLoading}
                      label='Ementa'
                      onChange={e => setEmenta(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      multiline
                      rows={4}
                      name='programa'
                      disabled={isLoading}
                      label='Programa'
                      onChange={e => setPrograma(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      name='cargaHoraria'
                      disabled={isLoading}
                      label='Carga Horária'
                      onChange={e => setCargaHoraria(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteFaculdade isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeIdChange} autoCompleteValue={selectedFaculdade}/>
                      <Button
                        variant="outlined"
                        style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                        onClick={handleOpenFaculdadeModal}
                      >
                        NOVA+
                      </Button>
                    </div>
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AutoCompleteCurso isExternalLoading={isLoading} faculdadeId={faculdadeId} autoCompleteValue={selectedCurso}/>
                      <Button
                        variant="outlined"
                        style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                        onClick={handleOpenCursoModal}
                      >
                        NOVO+
                      </Button>
                    </div>
                  </Grid>
                </Grid>

                <Grid container justifyContent="flex" padding={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        onClick={id !== 'nova' ? openSaveConfirmationModal : save}
                        startIcon={<Icon>save</Icon>}
                        style={{ marginRight: '10px' }} 

                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={id !== 'nova' ? openSaveAndCloseConfirmationModal : saveAndClose} 
                        startIcon={<Icon>save</Icon>}
                      >
                        Salvar e Fechar
                      </Button>
                    </Grid>
                  </Grid>

              </Grid>
            </Box>
          </VForm>
          </Paper>
        </Box>
      </Box>

      <Dialog open={isFaculdadeModalOpen} onClose={handleCloseFaculdadeModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Faculdade</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaFaculdade}
              onChange={e => setNovaFaculdade(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveFaculdade}
                startIcon={<Icon>save</Icon>}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseFaculdadeModal}
              >
                Fechar
              </Button>
            </div>
          </form>
        </DialogContent>

        {isLoading && (
          <Grid item>
            <LinearProgress variant="indeterminate" />
          </Grid>
        )}
      </Dialog>

      <Dialog open={isCursoModalOpen} onClose={handleCloseCursoModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Curso</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveCurso}>
          <Grid container direction="column" spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid item>
              <VTextField
                fullWidth
                name="novoCursoOrigem"
                label="Nome"
                value={novoCurso}
                onChange={(e) => setNovoCurso(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdade isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeIdChange} autoCompleteValue={selectedFaculdade}/>
            </Grid>
            <Grid item>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "10px", marginLeft: "20px", marginRight: "20px" }}
                  type="submit"
                  startIcon={<Icon>save</Icon>}
                >
                  Salvar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  autoFocus
                  style={{ marginTop: "10px", marginLeft: "10px", marginRight: "20px" }}
                  onClick={handleCloseCursoModal}
                >
                  Fechar
                </Button>
              </div>
            </Grid>
          </Grid>
        </VForm>
      </DialogContent>
    </Dialog>


      <Dialog open={isErrorModalOpen} onClose={closeErrorModal}>
        <DialogTitle>
          Erro!
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
          Sucesso!
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

      <Dialog open={isUpdateSuccessModalOpen} onClose={closeUpdateSuccessModal}>
        <DialogTitle>
        Registro atualizado com sucesso!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{successMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateSuccessModal} color="primary" autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmationSaveModalOpen} onClose={closeSaveConfirmationModal}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza de que deseja continuar com esta ação?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeSaveConfirmationModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSaveConfirmationAndSubmit} color="primary">
              Continuar
            </Button>
          </DialogActions>
      </Dialog>

      <Dialog open={isSaveAndCloseConfirmationModalOpen} onClose={closeSaveAndCloseConfirmationModal}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza de que deseja continuar com esta ação?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeSaveAndCloseConfirmationModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSaveAndCloseConfirmationAndSubmit} color="primary">
              Continuar
            </Button>
          </DialogActions>
      </Dialog>
      
    </LayoutBaseDePagina>
  );
};
