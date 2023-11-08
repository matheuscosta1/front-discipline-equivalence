import { useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, Button, Card, CardActions, CardContent, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Typography, makeStyles } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../shared/hooks';
import { FerramentasDaListagem, FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { IDetalheUsuario, IListagemUsuario, UsuarioService } from '../../shared/services/api/usuario/UsuarioService';
import { IVFormErrors, VForm, VTextField, useVForm } from '../../shared/forms';
import jwt_decode from 'jwt-decode';
import * as yup from 'yup';
import PasswordStrengthBar from './PasswordStrengthBar';
import zxcvbn from 'zxcvbn';

interface IFormData {
  nome: string;
  email: string;
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  nome: yup.string().required().required(),
  email: yup.string().email().required(),
  senhaAtual: yup.string().required(),
  novaSenha: yup.string().required(),
  confirmarSenha: yup.string().required(),
});

export const DetalheUsuario: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemUsuario>();
  const [isLoading, setIsLoading] = useState(true);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [entropy, setEntropy] = useState<number>(0);
  const [entropyConfirmarSenha, setEntropyConfirmarSenha] = useState<number>(0);


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

  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const openConfirmationModal = () => {
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleConfirmationAndSubmit = (dados: IFormData) => {
    closeConfirmationModal();
    handleSubmit(dados);
  };

  const handleSubmit = (dados: IFormData) => {
    setIsLoading(true);

    formValidationSchema
      .validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        const detalhe: IDetalheUsuario = {
          nome: dadosValidados.nome,
          email: getEmailDoUsuarioLogado(),
          novoEmail: dadosValidados.email,
          senhaAtual: dadosValidados.senhaAtual,
          novaSenha: dadosValidados.confirmarSenha
        };
        console.log(senhaAtual)
        console.log(novaSenha)

        if (dadosValidados.confirmarSenha !== dadosValidados.novaSenha) {
          setIsLoading(false);
          setErrorMessage('A confirmação de senha não coincide com a nova senha.');
          setIsErrorModalOpen(true);
        } else {
          UsuarioService.update(detalhe)
          .then((result) => {
            if (result instanceof Error) {
              if(result.message.includes('422')) {
                setIsLoading(false);
                setErrorMessage('Dados inválidos.');
                setIsErrorModalOpen(true);
              } else {
                alert(result.message);
              }
            } else {
              setSuccessMessage('Registro atualizado sucesso.');
              setIsSuccessModalOpen(true);          
              
              setIsLoading(false);
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

  const { id = 'nova' } = useParams<'id'>();

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

  useEffect(() => {
    setIsLoading(true);
    debounce(() => {
      UsuarioService.getByEmail(getEmailDoUsuarioLogado())
        .then((result) => {
          setIsLoading(false);
  
          if (result instanceof Error) {
            alert(result.message);
          } else {
            formRef.current?.setData(result);
          }
        });
    });
  }, [id]);

  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] = useState(false);
  
  const closeUpdateSuccessModal = () => {
    setIsUpdateSuccessModalOpen(false);
  };

  const { formRef, save, saveAndClose } = useVForm();

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

  const handlePasswordChange = (e: string) => {
    const newPassword = e;
    const passwordStrength = zxcvbn(newPassword);
    const entropy = passwordStrength.score * 20;
  
    setNovaSenha(newPassword);

    setEntropy(entropy);

    if (novaSenha !== newPassword) {
      setSenhasIguais(false);
      setMensagemErro('As senhas não coincidem');
    } else {
      setSenhasIguais(true);
      setMensagemErro('');
    }
  };

  const [senhasIguais, setSenhasIguais] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  const handlePasswordChangeConfirmation = (e: string) => {
    const newPassword = e;
    const passwordStrength = zxcvbn(newPassword);
    const entropy = passwordStrength.score * 20;
  
    setConfirmarSenha(newPassword);

    setEntropyConfirmarSenha(entropy);

    if (novaSenha !== newPassword) {
      setSenhasIguais(false);
      setMensagemErro('As senhas não coincidem');
    } else {
      setSenhasIguais(true);
      setMensagemErro('');
    }
  };

  const errorMessageStyle = {
    height: '100%',
    color: '#f44336',
    fontSize: '0.83rem',
    marginLeft: '8px'
  };

  const errorFieldStyle = {
    border: '1px solid #f44336',
    borderRadius: '5px',
  };

  const notErrorFieldStyle = {
  };


  return (
    <LayoutBaseDePagina
      titulo={'Configuração'}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          mostrarBotaoSalvarEFechar={false}
          mostrarBotaoSalvar={false}
          mostrarBotaoNovo={false}
          mostrarBotaoApagar={false}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/professores')}
          aoClicarEmNovo={() => navigate('/professores/detalhe/nova')}
        />
      }
    >
      <Box  margin={2} display="flex" justifyContent="center">
          <Box style={{ width: '100%' }}>
            <Paper variant="outlined" style={{ display: 'flex', justifyContent: 'center' }}>
            <VForm ref={formRef} onSubmit={handleConfirmationAndSubmit}>
              <Box margin={2} display="flex" flexDirection="column" component={Paper} variant="outlined" style={{ border: 'none' }}>
              
                <Grid container direction="column" padding={2} spacing={2}>

                  {isLoading && (
                    <Grid item>
                      <LinearProgress variant='indeterminate' />
                    </Grid>
                  )}

                  <Grid item>
                    <Typography variant='h6'>Atualizar dados cadastrais</Typography>
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
                        label='E-mail'
                        type='email'
                        onChange={e => setEmail(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <VTextField
                        fullWidth
                        name='senhaAtual'
                        disabled={isLoading}
                        label='Senha atual'
                        type='password'
                        onChange={e => setSenhaAtual(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <VTextField
                        fullWidth
                        name='novaSenha'
                        disabled={isLoading}
                        label='Nova senha'
                        type='password'
                        onChange={e => handlePasswordChange(e.target.value)}
                        style={senhasIguais === false ? errorFieldStyle : notErrorFieldStyle}
                      />
                    </Grid>
                  </Grid>

                  <PasswordStrengthBar entropy={entropy!!} />


                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <VTextField
                        fullWidth
                        name='confirmarSenha'
                        disabled={isLoading}
                        label='Confirmação da senha'
                        type='password'
                        onChange={e => handlePasswordChangeConfirmation(e.target.value)}
                        style={senhasIguais === false ? errorFieldStyle : notErrorFieldStyle}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    {senhasIguais === false && (
                      <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                        <Typography style={{height: '100%', color: '#f44336', fontSize: '0.83rem', marginLeft: '2px', whiteSpace: 'nowrap'}}>
                          {mensagemErro}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <PasswordStrengthBar entropy={entropyConfirmarSenha!!} />

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
    </LayoutBaseDePagina>
  );
};

