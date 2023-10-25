import { useEffect, useState } from 'react';
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';
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
    console.log("Dados analise equivalencia: ", dados)
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
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/analises');
                } else {
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
      titulo={id === 'nova' ? 'Nova alocacao analises professores' : "Novo alocacao professores"}
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
                <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeOrigemIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCursoOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} onCursoIdChange={handleCursoOrigemIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteDisciplinaOrigem isExternalLoading={isLoading} faculdadeId={faculdadeOrigemId} cursoId={cursoOrigemId}/>
              </Grid>
            </Grid>
            
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteFaculdadeDestino isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeDestinoIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCursoDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} onCursoIdChange={handleCursoDestinoIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteDisciplinaDestino isExternalLoading={isLoading} faculdadeId={faculdadeDestinoId} cursoId={cursoDestinoId} onDiscipinaDestinoIdChange={handleDisciplinaDestinoIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteProfessorPorDisciplinaDestino isExternalLoading={isLoading} disciplinaId={disciplinaDestinoId}/>
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

          
          </Grid>

        </Box>
      </VForm>
    </LayoutBaseDePagina>
  );
};
