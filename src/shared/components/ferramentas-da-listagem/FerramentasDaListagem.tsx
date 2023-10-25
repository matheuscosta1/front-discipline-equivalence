import { Box, Button, Icon, Paper, TextField, Typography, useTheme } from '@mui/material';


interface IFerramentasDaListagemProps {
  textoDaBusca?: string;
  mostrarInputBusca?: boolean;
  aoMudarTextoDeBusca?: (novoTexto: string) => void;
  textoBotaoNovo?: string;
  mostrarBotaoNovo?: boolean;
  mostrarBotaoVoltar?: boolean;
  aoClicarEmNovo?: () => void;
  aoClicarEmVoltar?: () => void;
  inputBusca: string;
}
export const FerramentasDaListagem: React.FC<IFerramentasDaListagemProps> = ({
  textoDaBusca = '',
  aoMudarTextoDeBusca,
  mostrarInputBusca = false,
  aoClicarEmNovo,
  textoBotaoNovo = 'Novo',
  mostrarBotaoNovo = true,
  mostrarBotaoVoltar = false,
  aoClicarEmVoltar,
  inputBusca = ''
}) => {
  const theme = useTheme();

  return (
    <Box
      gap={1}
      marginX={1}
      padding={1}
      paddingX={2}
      display="flex"
      alignItems="center"
      height={theme.spacing(5)}
      component={Paper}
    >
      {mostrarInputBusca && (
        <TextField
          size="small"
          value={textoDaBusca}
          placeholder={inputBusca}
          onChange={(e) => aoMudarTextoDeBusca?.(e.target.value)}
        />
      )}

      <Box flex={1} display="flex" justifyContent="end">
        {mostrarBotaoNovo && (
          <Button
            color='primary'
            disableElevation
            variant='contained'
            onClick={aoClicarEmNovo}
            endIcon={<Icon>add</Icon>}
          >{textoBotaoNovo}</Button>
        )}
      </Box>

      {(mostrarBotaoVoltar ) && (
        <Button
          color='primary'
          disableElevation
          variant='outlined'
          onClick={aoClicarEmVoltar}
          startIcon={<Icon>arrow_back</Icon>}
        >
          <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
            Voltar
          </Typography>
        </Button>
      )}
    </Box>
  );
};
