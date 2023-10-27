import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Icon, LinearProgress, Modal, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdadeOrigem } from './components/AutoCompleteFaculdadeOrigem';
import { AutoCompleteCursoOrigem } from './components/AutoCompleteCursoOrigem';
import { AutoCompleteFaculdadeDestino } from './components/AutoCompleteFaculdadeDestino';
import { AutoCompleteCursoDestino } from './components/AutoCompleteCursoDestino';
import { AutoCompleteDisciplinaOrigem } from './components/AutoCompleteDisciplinaOrigem';
import { AutoCompleteDisciplinaDestino } from './components/AutoCompleteDisciplinaDestino';
import { AutoCompleteProfessorPorDisciplinaDestino } from './components/AutoCompleteProfessorPorDisciplinaDestino';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import jwt_decode from 'jwt-decode';
import { ErrorOutline } from '@mui/icons-material';
import { IDetalheCurso, CursosService } from '../../shared/services/api/cursos/CursosService';
import { IDetalheDisciplina, DisciplinasService } from '../../shared/services/api/disciplinas/DisciplinasService';
import { IDetalheFaculdade, FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { IDetalheProfessores, ProfessoresService } from '../../shared/services/api/professores/ProfessoresService';

interface IFormData {
  faculdadeOrigemId: number;
  cursoOrigemId: number;
  disciplinaOrigemId: number;
  faculdadeDestinoId: number;
  cursoDestinoId: number;
  disciplinaDestinoId: number;
  professorId: number;
  dataMaxima: string;
  emailAdministrador: string;
  nomeAluno: string;
  emailAluno: string;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  faculdadeOrigemId: yup.number().required(),
  cursoOrigemId: yup.number().required(),
  disciplinaOrigemId: yup.number().required(),
  faculdadeDestinoId: yup.number().required(),
  cursoDestinoId: yup.number().required(),
  disciplinaDestinoId: yup.number().required(),
  professorId: yup.number().required(),
  emailAdministrador: yup.string().required(),
  nomeAluno: yup.string().required(),
  emailAluno: yup.string().required(),
  dataMaxima: yup
  .string()
  .required()
  .matches(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'A data deve estar no formato DD/MM/YYYY'
    )
});

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


export const DetalheDeAlocacaoAnalisesProfessores: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(false);
  
  const [faculdadeOrigemId, setFaculdadeOrigemId] = useState<number | undefined>(/* valor inicial */);

  const [cursoOrigemId, setCursoOrigemId] = useState<number | undefined>(/* valor inicial */);

  const [faculdadeDestinoId, setFaculdadeDestinoId] = useState<number | undefined>(/* valor inicial */);

  const [cursoDestinoId, setCursoDestinoId] = useState<number | undefined>(/* valor inicial */);
  
  const [disciplinaDestinoId, setDisciplinaDestinoId] = useState<number | undefined>(/* valor inicial */);
  const [nomeAluno, setNomeAluno] = useState('');
  const [emailAluno, setEmailAluno] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dataMaxima, setDataMaxima] = useState<string>('');

  const handleFaculdadeOrigemIdChange = (novoFaculdadeId: number | undefined) => {
    setFaculdadeOrigemId(novoFaculdadeId);
  };

  const handleFaculdadeDestinoIdChange = (novoFaculdadeId: number | undefined) => {
    setFaculdadeDestinoId(novoFaculdadeId);
  };

  const handleCursoOrigemIdChange = (novoCursoId: number | undefined) => {
    setCursoOrigemId(novoCursoId);
  };

  const handleCursoDestinoIdChange = (novoCursoId: number | undefined) => {
    setCursoDestinoId(novoCursoId);
  };

  const handleDisciplinaDestinoIdChange = (novaDisciplinaId: number | undefined) => {
    setDisciplinaDestinoId(novaDisciplinaId);
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


  const handleDisciplinaOrigemIdChange = (novaDisciplinaOrigemId: number | undefined) => {
    setDisciplinaOrigemId(novaDisciplinaOrigemId);
  };

  const [disciplinaOrigemId, setDisciplinaOrigemId] = useState<number | undefined>(/* valor inicial */);


  const [isFaculdadeOrigemModalOpen, setIsFaculdadeOrigemModalOpen] = useState(false);
  const [isFaculdadeDestinoModalOpen, setIsFaculdadeDestinoModalOpen] = useState(false);

  const [novaFaculdadeOrigem, setNovaFaculdadeOrigem] = useState('');
  const [novaFaculdadeDestino, setNovaFaculdadeDestino] = useState('');


  const handleOpenFaculdadeOrigemModal = () => {
    setIsFaculdadeOrigemModalOpen(true);
  };

  const handleOpenFaculdadeDestinoModal = () => {
    setIsFaculdadeDestinoModalOpen(true);
  };

  const handleCloseFaculdadeOrigemModal = () => {
    setIsFaculdadeOrigemModalOpen(false);
  };

  const handleCloseFaculdadeDestinoModal = () => {
    setIsFaculdadeDestinoModalOpen(false);
  };


  const handleCloseProfessorModal = () => {
    setIsProfessorModalOpen(false);
  };

  const handleOpenProfessorModal = () => {
    setIsProfessorModalOpen(true);
  };

  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);


  const [isCursoOrigemModalOpen, setIsCursoOrigemModalOpen] = useState(false);

  const [isCursoDestinoModalOpen, setIsCursoDestinoModalOpen] = useState(false);


  const [novoCursoOrigem, setNovoCursoOrigem] = useState('');

  const [novoCursoDestino, setNovoCursoDestino] = useState('');


  const handleOpenCursoOrigemModal = () => {
    setIsCursoOrigemModalOpen(true);
  };

  const handleOpenCursoDestinoModal = () => {
    setIsCursoDestinoModalOpen(true);
  };

  const handleCloseCursoOrigemModal = () => {
    setIsCursoOrigemModalOpen(false);
  };

  const handleCloseCursoDestinoModal = () => {
    setIsCursoDestinoModalOpen(false);
  };

  const [isDisciplinaOrigemModalOpen, setIsDisciplinaOrigemModalOpen] = useState(false);
  const [novaDisciplinaOrigem, setNovaDisciplinaOrigem] = useState('');
  const [novaCodigoOrigemDisciplinaOrigem, setCodigoOrigemDisciplinaOrigem] = useState('');
  const [novaEmentaDisciplinaOrigem, setEmenta] = useState('');
  const [novaCargaHorariaDisciplinaOrigem, setCargaHoraria] = useState<number | undefined>(/* valor inicial */);
  const [novoProgramaDisciplinaOrigem, setPrograma] = useState('');

  const [isDisciplinaDestinoModalOpen, setIsDisciplinaDestinoModalOpen] = useState(false);
  const [novaDisciplinaDestino, setNovaDisciplinaDestino] = useState('');
  const [novaCodigoOrigemDisciplinaDestino, setCodigoOrigemDisciplinaDestino] = useState('');
  const [novaEmentaDisciplinaDestino, setEmentaDestino] = useState('');
  const [novaCargaHorariaDisciplinaDestino, setCargaHorariaDestino] = useState<number | undefined>(/* valor inicial */);
  const [novoProgramaDisciplinaDestino, setProgramaDestino] = useState('');
  const [novoProfessor, setNovoProfessor] = useState('');
  const [emailProfessor, setEmailProfessor] = useState('');

  const handleOpenDisciplinaOrigemModal = () => {
    setIsDisciplinaOrigemModalOpen(true);
  };

  const handleOpenDisciplinaDestinoModal = () => {
    setIsDisciplinaDestinoModalOpen(true);
  };

  const handleCloseDisciplinaOrigemModal = () => {
    setIsDisciplinaOrigemModalOpen(false);
  };

  const handleCloseDisciplinaDestinoModal = () => {
    setIsDisciplinaDestinoModalOpen(false);
  };

  type TAutoCompleteOption = {
    id: number;
    label: string;
  }

  const [selectedFaculdadeOrigem, setSelectedFaculdadeOrigem] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovaFaculdadeIdChange = (novaFaculdade: TAutoCompleteOption | undefined) => {
    setSelectedFaculdadeOrigem(novaFaculdade);
  };

  const [selectedCursoOrigem, setSelectedCursoOrigem] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovoCursoIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedCursoOrigem(novoCurso);
  };

  const [selectedDisciplinaOrigem, setSelectedDisciplinaOrigem] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovoDisciplinaOrigemIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedDisciplinaOrigem(novoCurso);
  };


  const [selectedFaculdadeDestino, setSelectedFaculdadeDestino] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovaFaculdadeDestinoIdChange = (novaFaculdade: TAutoCompleteOption | undefined) => {
    setSelectedFaculdadeDestino(novaFaculdade);
  };

  const [selectedCursoDestino, setSelectedCursoDestino] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovoCursoDestinoIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedCursoDestino(novoCurso);
  };

  const [selectedDisciplinaDestino, setSelectedDisciplinaDestino] = useState<TAutoCompleteOption | undefined>(undefined);

  const handleNovoDisciplinaDestinoIdChange = (novoCurso: TAutoCompleteOption | undefined) => {
    setSelectedDisciplinaDestino(novoCurso);
  };

  const [selectedProfessor, setSelectedProfessor] = useState<TAutoCompleteOption | undefined>(undefined);


  const handleProfessorIdChange = (novoProfessor: TAutoCompleteOption | undefined) => {
    setSelectedProfessor(novoProfessor);
  };

  
  const handleSaveCursoOrigem = () => {

    const detalhe: IDetalheCurso = {
      id: Number(id),
      faculdadeId: Number(selectedFaculdadeOrigem!!.id),
      nome: novoCursoOrigem
    };
    setIsLoading(true);

    console.log(detalhe)

    CursosService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseCursoOrigemModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    handleNovoCursoIdChange(detalhe)

                    setTimeout(() => {
                      setIsLoading(false);
                      alert("Faculdade registrada com sucesso.")
                      handleCloseCursoOrigemModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveCursoDestino = () => {

    const detalhe: IDetalheCurso = {
      id: Number(id),
      faculdadeId: Number(selectedFaculdadeDestino!!.id),
      nome: novoCursoDestino
    };
    setIsLoading(true);

    console.log(detalhe)

    CursosService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseCursoDestinoModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    handleNovoCursoDestinoIdChange(detalhe)

                    setTimeout(() => {
                      setIsLoading(false);
                      alert("Faculdade registrada com sucesso.")
                      handleCloseCursoDestinoModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveFaculdadeOrigem = () => {
    const detalhe: IDetalheFaculdade = {
      id: Number(id),
      nome: novaFaculdadeOrigem
    };
    setIsLoading(true);
    FaculdadesService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseFaculdadeOrigemModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      handleNovaFaculdadeIdChange(detalhe)

                      setIsLoading(false);
                      alert("Faculdade registrada com sucesso.")
                      handleCloseFaculdadeOrigemModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveFaculdadeDestino = () => {
    const detalhe: IDetalheFaculdade = {
      id: Number(id),
      nome: novaFaculdadeDestino
    };
    setIsLoading(true);

    FaculdadesService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseFaculdadeDestinoModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      handleNovaFaculdadeDestinoIdChange(detalhe)

                      setIsLoading(false);
                      alert("Faculdade registrada com sucesso.")
                      handleCloseFaculdadeDestinoModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveDisciplinaOrigem = () => {

    const detalhe: IDetalheDisciplina = {
      id: Number(id),
      nome: novaDisciplinaOrigem,
      codigoOrigem: novaCodigoOrigemDisciplinaOrigem,
      ementa: novaEmentaDisciplinaOrigem,
      programa: novoProgramaDisciplinaOrigem,
      cargaHoraria: Number(novaCargaHorariaDisciplinaOrigem),
      faculdadeId: Number(selectedFaculdadeOrigem!!.id),
      cursoId: Number(selectedCursoOrigem!!.id)

    };
    setIsLoading(true);
    console.log("Entrou no handle de faculdade")

    DisciplinasService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseDisciplinaOrigemModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    console.log("Cadastro de faculdade id: ", Number(result.id));
                    

                    setTimeout(() => {
                      setDisciplinaOrigemId(Number(result.id))
                      
                      handleNovoDisciplinaOrigemIdChange(detalhe)

                      setIsLoading(false);
                      alert("Disciplina registrada com sucesso.")
                      handleCloseDisciplinaOrigemModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveDisciplinaDestino = () => {

    const detalhe: IDetalheDisciplina = {
      id: Number(id),
      nome: novaDisciplinaDestino,
      codigoOrigem: novaCodigoOrigemDisciplinaDestino,
      ementa: novaEmentaDisciplinaDestino,
      programa: novoProgramaDisciplinaDestino,
      cargaHoraria: Number(novaCargaHorariaDisciplinaDestino),
      faculdadeId: Number(selectedFaculdadeDestino!!.id),
      cursoId: Number(selectedCursoDestino!!.id)

    };
    setIsLoading(true);

    DisciplinasService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseDisciplinaDestinoModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    
                    setTimeout(() => {
                      setDisciplinaDestinoId(Number(result.id))
                      
                      handleNovoDisciplinaDestinoIdChange(detalhe)

                      setIsLoading(false);
                      alert("Disciplina registrada com sucesso.")
                      handleCloseDisciplinaDestinoModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveProfessor = () => {

    const detalhe: IDetalheProfessores = {
      id: Number(id),
      nome: novoProfessor,
      email: emailProfessor,
      faculdadeId: Number(selectedFaculdadeDestino!!.id),
      cursoId: Number(selectedCursoDestino!!.id),
      disciplinaId: Number(selectedDisciplinaDestino!!.id)

    };
    setIsLoading(true);


    ProfessoresService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseProfessorModal();
                    setIsLoading(false);
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    
                    setTimeout(() => {
                      
                      handleProfessorIdChange(detalhe)

                      setIsLoading(false);
                      alert("Professor registrado com sucesso.")
                      handleCloseProfessorModal();
                    }, 2000);
                  }
                });
  };

  
  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      AlocacaoAnalisesProfessoresService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/analises');
          } else {
            formRef.current?.setData(result);
          }
        });
    } else {
      formRef.current?.setData({
        nome: '',
        faculdadeOrigemId: undefined,
      });
    }
  }, [id]);


  const handleSave = (dados: IFormData) => {
    dados.emailAdministrador = getEmailDoUsuarioLogado();
    formValidationSchema
      .validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'nova') {
          AlocacaoAnalisesProfessoresService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                if(result.message.includes('422')) {
                  //alert('Análise de equivalência já foi registrada.');
                  setErrorMessage('Análise de equivalência já foi registrada.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Análise de equivalência cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/analises');
                } else {
                  setSuccessMessage('Análise de equivalência cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate(`/analises/detalhe/${result}`);
                }
              }
            });
        } else {
          AlocacaoAnalisesProfessoresService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  setSuccessMessage('Análise de equivalência cadastrada com sucesso.');
                  setIsSuccessModalOpen(true); 
                  navigate('/analises');
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
      AlocacaoAnalisesProfessoresService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            alert(result.message);
          } else {
            alert('Registro apagado com sucesso!');
            navigate('/analises');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova alocacao analises professores' : "Atualização de análise de equivalência"}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={id !== 'nova'}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/analises')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/analises/detalhe/nova')}
        />
      }
    >
      <VForm ref={formRef} onSubmit={handleSave}>
        <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

          <Grid container direction="column" padding={2} spacing={2}>

            {isLoading && (
              <Grid item>
                <LinearProgress variant='indeterminate' />
              </Grid>
            )}

            <Grid item>
              <Typography variant='h6'>Geral</Typography>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  name='nomeAluno'
                  disabled={isLoading}
                  label='Nome do aluno solicitante'
                  onChange={e => setNomeAluno(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  name='emailAluno'
                  disabled={isLoading}
                  label='E-mail do aluno solicitante'
                  onChange={e => setEmailAluno(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeOrigem}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenFaculdadeOrigemModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCursoOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} onCursoIdChange={handleCursoOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoOrigem}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenCursoOrigemModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteDisciplinaOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} cursoId={cursoOrigemId} disableField={id !== 'nova'} autoCompleteValue={selectedDisciplinaOrigem}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenDisciplinaOrigemModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>
            
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeDestino}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenFaculdadeDestinoModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCursoDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} onCursoIdChange={handleCursoDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoDestino}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenCursoDestinoModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteDisciplinaDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} cursoId={cursoDestinoId} onDiscipinaDestinoIdChange={handleDisciplinaDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedDisciplinaDestino}/>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenDisciplinaDestinoModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteProfessorPorDisciplinaDestino isExternalLoading={isLoading} disciplinaId={disciplinaDestinoId} autoCompleteValue={selectedProfessor} />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                  <Button variant="outlined" style={{ marginTop: '2px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}  onClick={handleOpenProfessorModal}>
                    NOVA +
                  </Button>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  name='dataMaxima'
                  label='Data máxima para análise'
                  disabled={isLoading}
                  onInput={e => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
                    if (value.length <= 8) {
                      const formattedValue = value
                        .slice(0, 8) // Limita a entrada a 8 caracteres (DDMMAAAA)
                        .replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3'); // Adiciona barras automaticamente
                      input.value = formattedValue;
                      setDataMaxima(formattedValue);
                    }
                  }}
                  placeholder='Exemplo: 14/05/1999'
                />
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
          </Grid>
        </Box>
      </VForm>

      <Dialog open={isFaculdadeOrigemModalOpen} onClose={handleCloseFaculdadeOrigemModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Faculdade de Origem</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaFaculdadeOrigem}
              onChange={e => setNovaFaculdadeOrigem(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveFaculdadeOrigem}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseFaculdadeOrigemModal}
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

      <Dialog open={isFaculdadeDestinoModalOpen} onClose={handleCloseFaculdadeDestinoModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Faculdade de Destino</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaFaculdadeDestino}
              onChange={e => setNovaFaculdadeDestino(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveFaculdadeDestino}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseFaculdadeDestinoModal}
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

      <Dialog open={isCursoOrigemModalOpen} onClose={handleCloseCursoOrigemModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Curso de Origem</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novoCursoOrigem}
              onChange={e => setNovoCursoOrigem(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Faculdade"
              value={novaFaculdadeOrigem}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveCursoOrigem}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseCursoOrigemModal}
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

      <Dialog open={isCursoDestinoModalOpen} onClose={handleCloseCursoDestinoModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Curso de Destino</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novoCursoDestino}
              onChange={e => setNovoCursoDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Faculdade"
              value={novaFaculdadeDestino}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveCursoDestino}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseCursoDestinoModal}
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

      <Dialog open={isDisciplinaOrigemModalOpen} onClose={handleCloseDisciplinaOrigemModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Disciplina de Origem</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaDisciplinaOrigem}
              onChange={e => setNovaDisciplinaOrigem(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Código Disciplina"
              value={novaCodigoOrigemDisciplinaOrigem}
              onChange={e => setCodigoOrigemDisciplinaOrigem(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Ementa"
              value={novaEmentaDisciplinaOrigem}
              onChange={e => setEmenta(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Programa"
              value={novoProgramaDisciplinaOrigem}
              onChange={e => setPrograma(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Carga horária"
              value={novaCargaHorariaDisciplinaOrigem}
              onChange={e => setCargaHoraria(Number(e.target.value))}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Faculdade"
              value={novaFaculdadeOrigem}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Curso"
              value={novoCursoOrigem}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveDisciplinaOrigem}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseDisciplinaOrigemModal}
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

      <Dialog open={isDisciplinaDestinoModalOpen} onClose={handleCloseDisciplinaDestinoModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Disciplina de Destino</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaDisciplinaDestino}
              onChange={e => setNovaDisciplinaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Código Disciplina"
              value={novaCodigoOrigemDisciplinaDestino}
              onChange={e => setCodigoOrigemDisciplinaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Ementa"
              value={novaEmentaDisciplinaDestino}
              onChange={e => setEmentaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Programa"
              value={novoProgramaDisciplinaDestino}
              onChange={e => setProgramaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Carga horária"
              value={novaCargaHorariaDisciplinaDestino}
              onChange={e => setCargaHorariaDestino(Number(e.target.value))}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Faculdade"
              value={novaFaculdadeDestino}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Curso"
              value={novoCursoDestino}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveDisciplinaDestino}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseDisciplinaDestinoModal}
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

      <Dialog open={isProfessorModalOpen} onClose={handleCloseProfessorModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Professor</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novoProfessor}
              onChange={e => setNovoProfessor(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="E-mail"
              value={emailProfessor}
              onChange={e => setEmailProfessor(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Faculdade"
              value={novaFaculdadeDestino}
              onChange={e => setEmentaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Curso"
              value={novoCursoDestino}
              onChange={e => setNovoCursoDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <TextField
              fullWidth
              label="Disciplina"
              value={novaDisciplinaDestino}
              onChange={e => setNovaDisciplinaDestino(e.target.value)}
              style={{ marginBottom: '16px' }} // Adicione margem inferior
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveProfessor}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseProfessorModal}
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
        Cadastro realizado com sucesso!
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

    </LayoutBaseDePagina>
  );
};
