import { useEffect, useRef, useState } from 'react';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Icon, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { CursosService } from '../../shared/services/api/cursos/CursosService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdade } from './components/AutoCompleteFaculdade';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IDetalheFaculdade, FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';


interface IFormData {
  nome: string;
  faculdadeId: number;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  faculdadeId: yup.number().required(),
  nome: yup.string().required().min(3),
});

export const DetalheDeCursos: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');

  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] = useState(false);
  
  const closeUpdateSuccessModal = () => {
    setIsUpdateSuccessModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const [isFaculdadeModalOpen, setIsFaculdadeModalOpen] = useState(false);
  const [novaFaculdade, setNovaFaculdade] = useState('');

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

  const handleOpenFaculdadeModal = () => {
    setIsFaculdadeModalOpen(true);
  };

  const handleCloseFaculdadeModal = () => {
    setIsFaculdadeModalOpen(false);
  };

  type TAutoCompleteOption = {
    id: number;
    label: string;
  }

  const initialFaculdade: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const [selectedFaculdade, setSelectedFaculdade] = useState<TAutoCompleteOption | null>(initialFaculdade);

  const handleNovaFaculdadeIdChange = (novaFaculdade: TAutoCompleteOption | null) => {
    setSelectedFaculdade(novaFaculdade);
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

                    handleNovaFaculdadeIdChange(detalhe)

                    setTimeout(() => {
                      setIsLoading(false);
                      
                      setSuccessMessage('Faculdade registrada com sucesso.');
                      setIsSuccessModalOpen(true); 
                      
                      handleCloseFaculdadeModal();
                    }, 2000);
                  }
                });

  };
  
  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      CursosService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/cursos');
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
      });
    }
  }, [id]);

  
  const handleSave = (dados: IFormData) => {

    formValidationSchema.
      validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'nova') {
          CursosService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                if(result.message.includes('422')) {
                  setErrorMessage('Curso já registrado.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Curso cadastrado com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/cursos');
                } else {
                  setSuccessMessage('Curso cadastrado com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate(`/cursos/detalhe/${result.id}`);
                }
              }
            });
        } else {
          CursosService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {

                setSuccessMessage('Curso atualizado com sucesso.');
                setIsUpdateSuccessModalOpen(true);
                
                if (isSaveAndClose()) {
                  navigate('/cursos');
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
      CursosService.deleteById(id)
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
            navigate('/cursos');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Novo curso' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoSalvar={false}
          mostrarBotaoSalvarEFechar={false}
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={false}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/cursos')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/cursos/detalhe/nova')}
        />
      }
    >
    <Box margin={2} display="flex" justifyContent="center">
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
                  <Typography variant='h6'>Curso</Typography>
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteFaculdade isExternalLoading={isLoading} autoCompleteValue={selectedFaculdade} />
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
