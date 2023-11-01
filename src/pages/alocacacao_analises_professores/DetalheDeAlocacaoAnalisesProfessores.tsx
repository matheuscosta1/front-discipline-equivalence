import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, Icon, InputLabel, LinearProgress, Modal, Paper, TextField, Typography } from '@mui/material';
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

  const initialOriginCollegeValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const initialOriginCourseValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const initialOriginDisciplineValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

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

  const initialProfessorDestinyValue: TAutoCompleteOption = {
    id: -1,
    label: "default"
  };

  const [selectedFaculdadeOrigem, setSelectedFaculdadeOrigem] = useState<TAutoCompleteOption | null>(initialOriginCollegeValue);

  const handleNovaFaculdadeIdChange = (novaFaculdade: TAutoCompleteOption | null) => {
    setSelectedFaculdadeOrigem(novaFaculdade);
  };

  const [selectedCursoOrigem, setSelectedCursoOrigem] = useState<TAutoCompleteOption | null>(initialOriginCourseValue);

  const handleNovoCursoIdChange = (novoCurso: TAutoCompleteOption | null) => {
    setSelectedCursoOrigem(novoCurso);
  };

  const [selectedDisciplinaOrigem, setSelectedDisciplinaOrigem] = useState<TAutoCompleteOption | null>(initialOriginDisciplineValue);

  const handleNovoDisciplinaOrigemIdChange = (novoCurso: TAutoCompleteOption | null) => {
    setSelectedDisciplinaOrigem(novoCurso);
  };


  const [selectedFaculdadeDestino, setSelectedFaculdadeDestino] = useState<TAutoCompleteOption | null>(initialDestinyCollegeValue);

  const handleNovaFaculdadeDestinoIdChange = (novaFaculdade: TAutoCompleteOption | null) => {
    setSelectedFaculdadeDestino(novaFaculdade);
  };

  const [selectedCursoDestino, setSelectedCursoDestino] = useState<TAutoCompleteOption | null>(initialDestinyCourseValue);

  const handleNovoCursoDestinoIdChange = (novoCurso: TAutoCompleteOption | null) => {
    setSelectedCursoDestino(novoCurso);
  };

  const [selectedDisciplinaDestino, setSelectedDisciplinaDestino] = useState<TAutoCompleteOption | null>(initialDestinyDisciplineValue);

  const handleNovoDisciplinaDestinoIdChange = (novoCurso: TAutoCompleteOption | null) => {
    setSelectedDisciplinaDestino(novoCurso);
  };

  const [selectedProfessor, setSelectedProfessor] = useState<TAutoCompleteOption | null>(initialProfessorDestinyValue);


  const handleProfessorIdChange = (novoProfessor: TAutoCompleteOption | null) => {
    setSelectedProfessor(novoProfessor);
  };

  
  const handleSaveCursoOrigem = () => {

    const detalhe: IDetalheCurso = {
      id: Number(id),
      faculdadeId: Number(selectedFaculdadeOrigem !== undefined ? selectedFaculdadeOrigem!!.id : faculdadeOrigemId),
      nome: novoCursoOrigem
    };
    setIsLoading(true);

    CursosService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Curso já foi registrado.');
                      setIsErrorModalOpen(true);
                      handleCloseCursoDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseCursoDestinoModal();
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

                      handleCloseCursoOrigemModal();
                    }, 2000);
                  }
                });
  };

  const handleSaveCursoDestino = () => {

    const detalhe: IDetalheCurso = {
      id: Number(id),
      faculdadeId: Number(selectedFaculdadeDestino !== undefined ? selectedFaculdadeDestino!!.id : faculdadeDestinoId),
      nome: novoCursoDestino
    };
    setIsLoading(true);

    CursosService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Curso já foi registrado.');
                      setIsErrorModalOpen(true);
                      handleCloseCursoDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseCursoDestinoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    handleNovoCursoDestinoIdChange(detalhe)

                    setTimeout(() => {
                      setIsLoading(false);

                      setSuccessMessage('Curso registrado com sucesso.');
                      setIsSuccessModalOpen(true); 

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
                    if(result.message.includes('422')) {
                      setErrorMessage('Faculdade já foi registrada.');
                      setIsErrorModalOpen(true);

                      handleCloseFaculdadeDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);

                      handleCloseFaculdadeDestinoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      handleNovaFaculdadeIdChange(detalhe)

                      setIsLoading(false);

                      setSuccessMessage('Faculdade registrada com sucesso.');
                      setIsSuccessModalOpen(true); 

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
                    if(result.message.includes('422')) {
                      setErrorMessage('Faculdade já foi registrada.');
                      setIsErrorModalOpen(true);

                      handleCloseFaculdadeDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);

                      handleCloseFaculdadeDestinoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      handleNovaFaculdadeDestinoIdChange(detalhe)

                      setSuccessMessage('Faculdade registrada com sucesso.');
                      setIsSuccessModalOpen(true); 

                      setIsLoading(false);
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
      faculdadeId: Number(selectedFaculdadeOrigem !== undefined ? selectedFaculdadeOrigem!!.id : faculdadeOrigemId),
      cursoId: Number(selectedCursoOrigem !== undefined ? selectedCursoOrigem!!.id : cursoOrigemId)

    };
    setIsLoading(true);

    DisciplinasService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Disciplina já foi registrada.');
                      setIsErrorModalOpen(true);
                      handleCloseDisciplinaDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseDisciplinaDestinoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };

                    setTimeout(() => {
                      setDisciplinaOrigemId(Number(result.id))
                      
                      handleNovoDisciplinaOrigemIdChange(detalhe)

                      setSuccessMessage('Disciplina registrada com sucesso.');
                      setIsSuccessModalOpen(true);

                      setIsLoading(false);
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
      faculdadeId: Number(selectedFaculdadeDestino !== undefined ? selectedFaculdadeDestino!!.id : faculdadeDestinoId),
      cursoId: Number(selectedCursoDestino !== undefined ? selectedCursoDestino!!.id : cursoDestinoId)

    };
    setIsLoading(true);

    DisciplinasService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Disciplina já foi registrada.');
                      setIsErrorModalOpen(true);
                      handleCloseDisciplinaDestinoModal();
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseDisciplinaDestinoModal();
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    
                    setTimeout(() => {
                      setDisciplinaDestinoId(Number(result.id))
                      
                      handleNovoDisciplinaDestinoIdChange(detalhe)

                      setSuccessMessage('Disciplina registrada com sucesso.');
                      setIsSuccessModalOpen(true);

                      setIsLoading(false);
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
      faculdadeId: Number(selectedFaculdadeDestino !== null ? selectedFaculdadeDestino.id : faculdadeDestinoId),
      cursoId: Number(selectedCursoDestino !== null ? selectedCursoDestino!!.id : cursoDestinoId),
      disciplinaId: Number(selectedDisciplinaDestino !== null ? selectedDisciplinaDestino!!.id : disciplinaDestinoId)
    };
    setIsLoading(true);


    ProfessoresService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    if(result.message.includes('422')) {
                      setErrorMessage('Professor já foi registrado.');
                      setIsErrorModalOpen(true);
                      handleCloseProfessorModal()
                      setIsLoading(false);
                    } else {
                      alert(result.message);
                      handleCloseProfessorModal()
                      setIsLoading(false);
                    }
                  } else {
                    const detalhe: TAutoCompleteOption = {
                      id: Number(result.id),
                      label: result.nome
                    };
                    
                    setTimeout(() => {
                      
                      handleProfessorIdChange(detalhe)

                      setIsLoading(false);
                      setSuccessMessage('Professor registrado com sucesso.');
                      setIsSuccessModalOpen(true); 
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
                  setErrorMessage('Análise de equivalência já foi registrada.\nConfira na seção Equivalências se ela já foi analizada.');
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
                if(result.message.includes('422')) {
                  setErrorMessage('Erro ao atualizar análise de equivalência.');
                  setIsErrorModalOpen(true);
                } else {
                  alert(result.message);
                }
              } else {
                setSuccessMessage('Análise de equivalência atualizada com sucesso.');
                setIsUpdateSuccessModalOpen(true); 
                if (isSaveAndClose()) {
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
            if(result.message.includes('422')) {
              setErrorMessage('Não foi possível deletar a análise de equivalência.');
              setIsErrorModalOpen(true);
            } else {
              alert(result.message);
            }
          } else {
            setSuccessMessage('Registro apagado com sucesso.');
            setIsSuccessModalOpen(true); 
            navigate('/analises');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova alocação de análise de equivalência a um professor' : "Atualização de análise de equivalência"}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar={false}
          mostrarBotaoSalvar={false}
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
                    <Typography variant='h6'>Análise de equivalência</Typography>
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeOrigemIdChange={handleFaculdadeOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeOrigem}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenFaculdadeOrigemModal}
                        >
                          NOVA+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteCursoOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} onCursoIdChange={handleCursoOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoOrigem}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenCursoOrigemModal}
                        >
                          NOVO+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteDisciplinaOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} cursoId={cursoOrigemId} disableField={id !== 'nova'} autoCompleteValue={selectedDisciplinaOrigem}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenDisciplinaOrigemModal}
                        >
                          NOVA+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeDestino}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenFaculdadeDestinoModal}
                        >
                          NOVA+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteCursoDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} onCursoIdChange={handleCursoDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoDestino}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenCursoDestinoModal}
                        >
                          NOVO+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteDisciplinaDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} cursoId={cursoDestinoId} onDiscipinaDestinoIdChange={handleDisciplinaDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedDisciplinaDestino}/>
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenDisciplinaDestinoModal}
                        >
                          NOVA+
                        </Button>
                      </div>
                    </Grid>
                  </Grid>        

                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AutoCompleteProfessorPorDisciplinaDestino isExternalLoading={isLoading} disciplinaId={disciplinaDestinoId} autoCompleteValue={selectedProfessor} />
                        <Button
                          variant="outlined"
                          style={{ marginLeft: '10px', minWidth: 'auto', fontSize: '1.0rem', height: '55px' }}
                          onClick={handleOpenProfessorModal}
                        >
                          NOVO+
                        </Button>
                      </div>
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
                  </Grid>
                  <Grid container justifyContent="flex" padding={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        onClick={id !== 'nova' ? openSaveConfirmationModal : save}
                        startIcon={<Icon>save</Icon>}
                        style={{ marginRight: '10px' }} // Adiciona uma margem à esquerda

                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={id !== 'nova' ? openSaveAndCloseConfirmationModal : saveAndClose} // Defina a função que deve ser chamada ao clicar neste botão
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
                startIcon={<Icon>save</Icon>}
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
                startIcon={<Icon>save</Icon>}
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
        <VForm onSubmit={handleSaveCursoOrigem}>
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
                value={novoCursoOrigem}
                onChange={(e) => setNovoCursoOrigem(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeOrigemIdChange={handleFaculdadeOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeOrigem}/>
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
                  onClick={handleCloseCursoOrigemModal}
                >
                  Fechar
                </Button>
              </div>
            </Grid>
          </Grid>
        </VForm>
      </DialogContent>
    </Dialog>


    <Dialog open={isCursoDestinoModalOpen} onClose={handleCloseCursoDestinoModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Curso de Destino</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveCursoDestino}>
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
                value={novoCursoDestino}
                onChange={(e) => setNovoCursoDestino(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeDestino}/>
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
                  onClick={handleCloseCursoDestinoModal}
                >
                  Fechar
                </Button>
              </div>
            </Grid>
          </Grid>
        </VForm>
      </DialogContent>
    </Dialog>


    <Dialog open={isDisciplinaOrigemModalOpen} onClose={handleCloseDisciplinaOrigemModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Disciplina de Origem</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveDisciplinaOrigem}>
          <Grid container direction="column" spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid item>
              <VTextField
                fullWidth
                name="novaDisciplinaOrigem"
                label="Nome"
                value={novaDisciplinaOrigem}
                onChange={(e) => setNovaDisciplinaOrigem(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCodigoOrigemDisciplinaOrigem"
                label="Código Disciplina"
                value={novaCodigoOrigemDisciplinaOrigem}
                onChange={(e) => setCodigoOrigemDisciplinaOrigem(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novaEmentaDisciplinaOrigem"
                label="Ementa"
                value={novaEmentaDisciplinaOrigem}
                onChange={(e) => setEmenta(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novoProgramaDisciplinaOrigem"
                label="Programa"
                value={novoProgramaDisciplinaOrigem}
                onChange={(e) => setPrograma(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCargaHorariaDisciplinaOrigem"
                label="Carga horária"
                value={novaCargaHorariaDisciplinaOrigem}
                onChange={(e) => setCargaHoraria(Number(e.target.value))}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeOrigemIdChange={handleFaculdadeOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeOrigem}/>
            </Grid>
            <Grid item>
              <AutoCompleteCursoOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} onCursoIdChange={handleCursoOrigemIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoOrigem}/>
            </Grid>
            <Grid item>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                  type="submit"
                  startIcon={<Icon>save</Icon>}
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
            </Grid>
          </Grid>
        </VForm>
      </DialogContent>
    </Dialog>


    <Dialog open={isDisciplinaDestinoModalOpen} onClose={handleCloseDisciplinaDestinoModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Disciplina de Destino</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveDisciplinaDestino}>
          <Grid container direction="column" spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid item>
              <VTextField
                fullWidth
                name="novaDisciplinaDestino"
                label="Nome"
                value={novaDisciplinaDestino}
                onChange={(e) => setNovaDisciplinaDestino(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCodigoOrigemDisciplinaDestino"
                label="Código Disciplina"
                value={novaCodigoOrigemDisciplinaDestino}
                onChange={(e) => setCodigoOrigemDisciplinaDestino(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novaEmentaDisciplinaDestino"
                label="Ementa"
                value={novaEmentaDisciplinaDestino}
                onChange={(e) => setEmentaDestino(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                multiline
                rows={4}
                name="novoProgramaDisciplinaDestino"
                label="Programa"
                value={novoProgramaDisciplinaDestino}
                onChange={(e) => setProgramaDestino(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="novaCargaHorariaDisciplinaDestino"
                label="Carga horária"
                value={novaCargaHorariaDisciplinaDestino}
                onChange={(e) => setCargaHorariaDestino(Number(e.target.value))}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeDestino}/>
            </Grid>
            <Grid item>
              <AutoCompleteCursoDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} onCursoIdChange={handleCursoDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoDestino}/>
            </Grid>
            <Grid item>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                  type="submit"
                  startIcon={<Icon>save</Icon>}
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
            </Grid>
          </Grid>
        </VForm>
      </DialogContent>
    </Dialog>


    <Dialog open={isProfessorModalOpen} onClose={handleCloseProfessorModal} BackdropComponent={Backdrop}>
      <DialogTitle>Registrar Professor</DialogTitle>
      <DialogContent>
        <VForm onSubmit={handleSaveProfessor}>
          <Grid container direction="column" spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid item>
              <VTextField
                fullWidth
                name="novoProfessor"
                label="Nome"
                value={novoProfessor}
                onChange={(e) => setNovoProfessor(e.target.value)}
                style={{ marginBottom: '16px' }}
              />
            </Grid>
            <Grid item>
              <VTextField
                fullWidth
                name="emailProfessor"
                label="E-mail"
                value={emailProfessor}
                onChange={(e) => setEmailProfessor(e.target.value)}
                style={{ marginBottom: '16px' }}
              />
            </Grid>
            <Grid item>
              <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedFaculdadeDestino}/>
            </Grid>
            <Grid item>
              <AutoCompleteCursoDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} onCursoIdChange={handleCursoDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedCursoDestino}/>
            </Grid>
            <Grid item>
              <AutoCompleteDisciplinaDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} cursoId={cursoDestinoId} onDiscipinaDestinoIdChange={handleDisciplinaDestinoIdChange} disableField={id !== 'nova'} autoCompleteValue={selectedDisciplinaDestino}/>
            </Grid>
            <Grid item>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                  type="submit"
                  startIcon={<Icon>save</Icon>}
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
