import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

import { FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { CursosService } from '../../shared/services/api/cursos/CursosService';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';


export const Dashboard = () => {
  const [isLoadingFaculdades, setIsLoadingFaculdades] = useState(true);
  const [totalCountFaculdades, setTotalCountFaculdades] = useState(0);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);
  const [totalCountCursos, setTotalCountCursos] = useState(0);

  useEffect(() => {
    setIsLoadingFaculdades(true);
    setIsLoadingCursos(true);

    FaculdadesService.getAll(1)
      .then((result) => {
        setIsLoadingFaculdades(false);

        if (result instanceof Error) {
          alert(result.message);
        } else {
          setTotalCountFaculdades(result.totalCount);
        }
      });
    CursosService.getAll(1)
      .then((result) => {
        setIsLoadingCursos(false);

        if (result instanceof Error) {
          alert(result.message);
        } else {
          setTotalCountCursos(result.totalCount);
        }
      });  

  }, []);


  return (
    <LayoutBaseDePagina
      titulo='Página inicial'
      barraDeFerramentas={<FerramentasDaListagem mostrarBotaoNovo={false}
        inputBusca = 'Pesquisar...'
      />}
    >
      <Box width='100%' display='flex'>
        <Grid container margin={2}>
          <Grid item container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>

              <Card>
                <CardContent>
                  <Typography variant='h5' align='center'>
                    Total de Faculdades
                  </Typography>

                  <Box padding={6} display='flex' justifyContent='center' alignItems='center'>
                    {!isLoadingFaculdades && (
                      <Typography variant='h1'>
                        {totalCountFaculdades}
                      </Typography>
                    )}
                    {isLoadingFaculdades && (
                      <Typography variant='h6'>
                        Carregando...
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>

              <Card>
                <CardContent>
                  <Typography variant='h5' align='center'>
                    Total de Cursos
                  </Typography>

                  <Box padding={6} display='flex' justifyContent='center' alignItems='center'>
                    {!isLoadingCursos && (
                      <Typography variant='h1'>
                        {totalCountCursos}
                      </Typography>
                    )}
                    {isLoadingCursos && (
                      <Typography variant='h6'>
                        Carregando...
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

            </Grid>

            {/* <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>

              <Card>
                <CardContent>
                  <Typography variant='h5' align='center'>
                    Total de pessoas
                  </Typography>

                  <Box padding={6} display='flex' justifyContent='center' alignItems='center'>
                    {!isLoadingPessoas && (
                      <Typography variant='h1'>
                        {totalCountPessoas}
                      </Typography>
                    )}
                    {isLoadingPessoas && (
                      <Typography variant='h6'>
                        Carregando...
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

            </Grid> */}

          </Grid>
        </Grid>
      </Box>
    </LayoutBaseDePagina>
  );
};
