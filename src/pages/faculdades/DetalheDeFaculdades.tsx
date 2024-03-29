import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Icon, LinearProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';


interface IFormData {
  nome: string;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  nome: yup.string().required().min(3),
});

export const DetalheDeFaculdades: React.FC = () => {
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

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      FaculdadesService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/faculdades');
          } else {
            setNome(result.nome);
            formRef.current?.setData(result);
          }
        });
    } else {
      formRef.current?.setData({
        nome: '',
      });
    }
  }, [id]);


  const handleSave = (dados: IFormData) => {
    formValidationSchema.
      validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'nova') {
          FaculdadesService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                if(result.message.includes('422')) {
                  setErrorMessage('Faculdade já registrada.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Faculdade cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/faculdades');
                } else {
                  setSuccessMessage('Faculdade cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate(`/faculdades/detalhe/${result.id}`);
                }
              }
            });
        } else {
          FaculdadesService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                setSuccessMessage('Faculdade atualizada com sucesso.');
                setIsUpdateSuccessModalOpen(true); 
                if (isSaveAndClose()) {
                  navigate('/faculdades');
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
      FaculdadesService.deleteById(id)
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
            navigate('/faculdades');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova faculdade' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar={false}
          mostrarBotaoSalvar={false}
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={false}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/faculdades')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/faculdades/detalhe/nova')}
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
                  <Typography variant='h6'>Faculdade</Typography>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                    <VTextField
                      fullWidth
                      name='nome'
                      label='Nome'
                      disabled={isLoading}
                      onChange={e => setNome(e.target.value)}
                    />
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
