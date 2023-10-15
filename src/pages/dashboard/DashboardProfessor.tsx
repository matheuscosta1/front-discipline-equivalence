import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

import { FaculdadesService } from '../../shared/services/api/faculdades/FaculdadesService';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';


export const DashboardProfessor = () => {
  const [isLoadingFaculdades, setIsLoadingFaculdades] = useState(true);
  const [totalCountFaculdades, setTotalCountFaculdades] = useState(0);

  useEffect(() => {
    setIsLoadingFaculdades(true);

    FaculdadesService.getAll(1)
      .then((result) => {
        setIsLoadingFaculdades(false);

        if (result instanceof Error) {
          alert(result.message);
        } else {
          setTotalCountFaculdades(result.totalCount);
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
