import { useEffect, useState } from 'react';
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { AlocacaoAnalisesProfessoresService } from '../../shared/services/api/alocacao_analises_professores/AlocacaoAnalisesProfessoresService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { AutoCompleteFaculdadeOrigem } from './components/AutoCompleteFaculdadeOrigem';
import { AutoCompleteCursoOrigem } from './components/AutoCompleteCursoOrigem';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';


interface IFormData {
  faculdadeOrigemId: number;
  cursoOrigemId: number;
  disciplinaOrigemId: number;
  faculdadeDestinoId: number;
  cursoDestinoId: number;
  disciplinaDestinoId: number;
  professorId: number;
}
const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
  faculdadeOrigemId: yup.number().required(),
  cursoOrigemId: yup.number().required(),
  disciplinaOrigemId: yup.number().required(),
  faculdadeDestinoId: yup.number().required(),
  cursoDestinoId: yup.number().required(),
  disciplinaDestinoId: yup.number().required(),
  professorId: yup.number().required()
});

export const DetalheDeAlocacaoAnalisesProfessores: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(false);
  const [faculdadeIdOrigem, setFaculdadeOrigemId] = useState(0);
  
  const [faculdadeId, setFaculdadeId] = useState<number | undefined>(/* valor inicial */);

  const handleFaculdadeIdChange = (novoFaculdadeId: number | undefined) => {
    setFaculdadeId(novoFaculdadeId);
  };

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      AlocacaoAnalisesProfessoresService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/alocacao-analises-professores');
          } else {
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
          AlocacaoAnalisesProfessoresService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/alocacao-analises-professores');
                } else {
                  navigate(`/alocacao-analises-professores/detalhe/${result}`);
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
                  navigate('/alocacao-analises-professores');
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
            navigate('/alocacao-analises-professores');
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
          aoClicarEmVoltar={() => navigate('/alocacao-analises-professores')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/alocacao-analises-professores/detalhe/nova')}
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
                <AutoCompleteFaculdadeOrigem isExternalLoading={isLoading} onFaculdadeIdChange={handleFaculdadeIdChange}/>
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <AutoCompleteCursoOrigem isExternalLoading={isLoading} faculdadeId={faculdadeId}/>
              </Grid>
            </Grid>

          </Grid>

        </Box>
      </VForm>
    </LayoutBaseDePagina>
  );
};
