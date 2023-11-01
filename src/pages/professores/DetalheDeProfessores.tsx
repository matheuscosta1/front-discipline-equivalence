import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Icon, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { ProfessoresService } from '../../shared/services/api/professores/ProfessoresService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdade } from './components/AutoCompleteFaculdade';
import { AutoCompleteCurso } from './components/AutoCompleteCurso';
import { AutoCompleteDisciplina } from './components/AutoCompleteDisciplina';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IDetalheCurso, CursosService } from '../../shared/services/api/cursos/CursosService';
import { IDetalheFaculdade, FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { DisciplinasService, IDetalheDisciplina } from '../../shared/services/api/disciplinas/DisciplinasService';


interface IFormData {
  nome: string;
  email: string;
  faculdadeId: number;
  cursoId: number;
  disciplinaId: number;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  nome: yup.string().required().min(3),
  email: yup.string().email().required(),
  faculdadeId: yup.number().required(),
  cursoId: yup.number().required(),
  disciplinaId: yup.number().required()
});

export const DetalheDeProfessores: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();

  const [faculdadeId, setFaculdadeId] = useState<number | undefined>(/* valor inicial */);

  const [cursoId, setCursoId] = useState<number | undefined>(/* valor inicial */);

  const handleFaculdadeIdChange = (novoFaculdadeId: number | undefined) => {
    setFaculdadeId(novoFaculdadeId);
  };

  const handleCursoIdChange = (novoCursoId: number | undefined) => {
    setCursoId(novoCursoId);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

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

  const handleDisciplinaIdChange = (novaDisciplinaId: number | undefined) => {
    setDisciplinaId(novaDisciplinaId);
  };

  const [disciplinaId, setDisciplinaId] = useState<number | undefined>(/* valor inicial */);


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

  const [isDisciplinaModalOpen, setIsDisciplinaModalOpen] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState('');
  const [novaCodigoOrigem, setCodigoOrigem] = useState('');
  const [novaEmenta, setEmenta] = useState('');
  const [novaCargaHoraria, setCargaHoraria] = useState<number | undefined>(/* valor inicial */);
  const [novoPrograma, setPrograma] = useState('');


  const handleOpenDisciplinaModal = () => {
    setIsDisciplinaModalOpen(true);
  };

  const handleCloseDisciplinaModal = () => {
    setIsDisciplinaModalOpen(false);
  };

  type TAutoCompleteOption = {
    id: number;
    label: string;
  }

  const initialDestinyCollegeValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const initialDestinyCourseValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const initialDestinyDisciplineValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const [selectedFaculdade, setSelectedFaculdade] = useState<TAutoCompleteOption | undefined>(initialDestinyCollegeValue);

  const handleNovaFaculdadeIdChange = (novaFaculdade: TAutoCompleteOption | undefined) => {
    setSelectedFaculdade(novaFaculdade);
  };

  const [selectedCurso, setSelectedCurso] = useState<TAutoCompleteOption | undefined>(initialDestinyCourseValue);

  const handleNovoCursoIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedCurso(novoCurso);
  };

  const [selectedDisciplina, setSelectedDisciplina] = useState<TAutoCompleteOption | undefined>(initialDestinyDisciplineValue);

  const handleNovoDisciplinaIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedDisciplina(novoCurso);
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

  const handleSaveDisciplina = () => {

    const detalhe: IDetalheDisciplina = {
      id: Number(id),
      nome: novaDisciplina,
      codigoOrigem: novaCodigoOrigem,
      ementa: novaEmenta,
      programa: novoPrograma,
      cargaHoraria: Number(novaCargaHoraria),
      faculdadeId: Number(selectedFaculdade!!.id),
      cursoId: Number(selectedCurso!!.id)

    };
    setIsLoading(true);

    DisciplinasService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Disciplina já foi registrada.');
                      setIsErrorModalOpen(true);
                      handleCloseDisciplinaModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseDisciplinaModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      setDisciplinaId(Number(result.id))
                      
                      handleNovoDisciplinaIdChange(detalhe)

                      setIsLoading(false);

                      setSuccessMessage('Disciplina registrada com sucesso.');
                      setIsSuccessModalOpen(true);

                      handleCloseDisciplinaModal();
                    }, 2000);
                  }
                });
  };

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      ProfessoresService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/professores');
          } else {
            const detalhe: TAutoCompleteOption = {
              id: Number(result.faculdadeId),
              label: result.nomeFaculdade
            };
            handleNovaFaculdadeIdChange(detalhe)
            setNome(result.nome);
            formRef.current?.setData(result);
          }
        });
    } else {
      formRef.current?.setData({
        nome: '',
        faculdadeId: undefined,
        cursoId: undefined,
        disciplinaId: undefined,
      });
    }
  }, [id]);


  const handleSave = (dados: IFormData) => {

    formValidationSchema.
      validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'nova') {
          ProfessoresService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                if(result.message.includes('422')) {
                  setErrorMessage('Professor já registrado.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Professor cadastrado com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/professores');
                } else {
                  setSuccessMessage('Professor cadastrado com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate(`/professores/detalhe/${result.id}`);
                }
              }
            });
        } else {
          ProfessoresService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                setSuccessMessage('Professor atualizado com sucesso.');
                setIsUpdateSuccessModalOpen(true); 
                if (isSaveAndClose()) {
                  navigate('/professores');
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
      ProfessoresService.deleteById(id)
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
            navigate('/professores');
          }
        });
    }
  };

  const centerFormStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500%',
  };

  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Novo professor' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={id !== 'nova'}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/professores')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/professores/detalhe/nova')}
        />
      }
    >
      <Box  margin={2} display="flex" justifyContent="center">
          <Box style={{ width: '100%' }}>
            <Paper variant="outlined" style={{ display: 'flex', justifyContent: 'center' }}>
            <VForm ref={formRef} onSubmit={handleSave}>
              <Box margin={2} display="flex" flexDirection="column" component={Paper} variant="outlined" style={{ border: 'none' }}>
              
                <Grid container direction="column" padding={2} spacing={2}>

                  {isLoading && (
                    <Grid item>
                      <LinearProgress variant='indeterminate' />
                    </Grid>
                  )}

                  <Grid item>
                    <Typography variant='h6'>Professor</Typography>
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
                        name='email'
                        disabled={isLoading}
                        label='Email'
                        onChange={e => setEmail(e.target.value)}
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
                      <AutoCompleteCurso isExternalLoading={isLoading} faculdadeId={faculdadeId} onCursoIdChange={handleCursoIdChange} autoCompleteValue={selectedCurso}/>
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

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteDisciplina isExternalLoading={isLoading} faculdadeId={faculdadeId} cursoId={cursoId} autoCompleteValue={selectedDisciplina}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenDisciplinaModal}
                        >
                          NOVA+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container justifyContent="space-between" padding={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        onClick={save}
                        startIcon={<Icon>save</Icon>}
                      >
                        Salvar
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
                name="novoCursoDestino"
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


    <Dialog open={isDisciplinaModalOpen} onClose={handleCloseDisciplinaModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Disciplina</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveDisciplina}>
          <Grid container direction="column" spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid item>
              <VTextField
                fullWidth
                name="novaDisciplina"
                label="Nome"
                value={novaDisciplina}
                onChange={(e) => setNovaDisciplina(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCodigoOrigem"
                label="Código Disciplina"
                value={novaCodigoOrigem}
                onChange={(e) => setCodigoOrigem(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novaEmenta"
                label="Ementa"
                value={novaEmenta}
                onChange={(e) => setEmenta(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novoPrograma"
                label="Programa"
                value={novoPrograma}
                onChange={(e) => setPrograma(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCargaHoraria"
                label="Carga horária"
                value={novaCargaHoraria}
                onChange={(e) => setCargaHoraria(Number(e.target.value))}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdade isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeIdChange} autoCompleteValue={selectedFaculdade}/>
            </Grid>
            <Grid item>
              <AutoCompleteCurso isExternalLoading={isLoading} faculdadeId={faculdadeId} onCursoIdChange={handleCursoIdChange} autoCompleteValue={selectedCurso}/>
            </Grid>
            <Grid item>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                  type="submit"
                >
                  Salvar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  autoFocus
                  style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                  onClick={handleCloseDisciplinaModal}
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
        Registro realizado!
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
    </LayoutBaseDePagina>
  );
};
