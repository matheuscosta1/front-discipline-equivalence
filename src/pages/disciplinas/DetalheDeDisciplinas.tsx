import { useEffect, useState } from 'react';
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { DisciplinasService } from '../../shared/services/api/disciplinas/DisciplinasService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdade } from './components/AutoCompleteFaculdade';
import { AutoCompleteCurso } from './components/AutoCompleteCurso';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';


interface IFormData {
  nome: string;
  codigoOrigem: string;
  ementa: string;
  programa: string;
  cargaHoraria: string;
  faculdadeId: number;
  cursoId: number;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  nome: yup.string().required().min(3),
  codigoOrigem: yup.string().required().min(3),
  ementa: yup.string().required().min(3),
  programa: yup.string().required().min(3),
  cargaHoraria: yup.string().required().min(3),
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
            setNome(result.nome);
            setEmenta(result.ementa);
            setPrograma(result.programa);
            setCargaHoraria(result.cargaHoraria);
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
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/disciplinas');
                } else {
                  navigate(`/disciplinas/detalhe/${result}`);
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
        
        console.log("Erro validacao", validationErrors);

        formRef.current?.setErrors(validationErrors);
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Realmente deseja apagar?')) {
      DisciplinasService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            alert(result.message);
          } else {
            alert('Registro apagado com sucesso!');
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
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={id !== 'nova'}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/disciplinas')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/disciplinas/detalhe/nova')}
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
                  label='Código Disciplina Origem'
                  onChange={e => setCodigoOrigem(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
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
                <AutoCompleteFaculdade isExternalLoading={isLoading} />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCurso isExternalLoading={isLoading} />
              </Grid>
            </Grid>

          </Grid>
        </Box>
      </VForm>
    </LayoutBaseDePagina>
  );
};
