import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Backdrop, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, LinearProgress, TextField } from '@mui/material';

import { FaculdadesService, IDetalheFaculdade } from '../../../shared/services/api/faculdades/FaculdadesService';
import { useDebounce } from '../../../shared/hooks';
import { useField } from '@unform/core';
import { useParams } from 'react-router-dom';


type TAutoCompleteOption = {
  id: number;
  label: string;
}

interface IAutoCompleteFaculdadeProps {
  isExternalLoading?: boolean;
  autoCompleteValue?: TAutoCompleteOption | null;
}
export const AutoCompleteFaculdade: React.FC<IAutoCompleteFaculdadeProps> = ({ isExternalLoading = false, autoCompleteValue = null }) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('faculdadeId');
  const { debounce } = useDebounce();

  const [selectedId, setSelectedId] = useState<number | undefined>(defaultValue);

  const [opcoes, setOpcoes] = useState<TAutoCompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => autoCompleteValue!!.id,
      setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
    });
  }, [registerField, fieldName, selectedId]);

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      FaculdadesService.getAll(0, busca)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            // alert(result.message);
          } else {
            console.log(result);
            const opcoesComNovaOpcao = [
              { id: -3, label: 'Criar nova +' },
              { id: -2, label: '--------------------------------------------------------' },  
              ...result.content.map(faculdade => ({ id: faculdade.id, label: faculdade.nome })), // Suas outras opções
            ];
            setOpcoes(opcoesComNovaOpcao);
          }
        });

    
    });
  }, [busca, debounce]);

  const autoCompleteSelectedOption = useMemo(() => {
    if (!selectedId) return null;

    const selectedOption = opcoes.find(opcao => opcao.id === selectedId);
    if (!selectedOption) return null;

    return selectedOption;
  }, [selectedId, opcoes]);

  if (autoCompleteSelectedOption !== null) {
    autoCompleteValue!!.id = autoCompleteSelectedOption.id
    autoCompleteValue!!.label = autoCompleteSelectedOption.label
  }

  const [isFaculdadeModalOpen, setIsFaculdadeModalOpen] = useState(false);
  const [novaFaculdade, setNovaFaculdade] = useState('');

  const handleOpenFaculdadeModal = () => {
    setIsFaculdadeModalOpen(true);
  };

  const handleCloseFaculdadeModal = () => {
    setIsFaculdadeModalOpen(false);
  };
  const { id = 'nova' } = useParams<'id'>();


  const handleSaveFaculdade = () => {
    // Lógica para salvar a nova faculdade aqui
    // Após salvar, atualize o campo "Faculdade" e feche a modal

    const detalhe: IDetalheFaculdade = {
      id: Number(id),
      nome: novaFaculdade
    };
    setIsLoading(true);

    FaculdadesService.create(detalhe)
                .then((result) => {

                  if (result instanceof Error) {
                    alert(result.message);
                    handleCloseFaculdadeModal();
                    setIsLoading(false);
                  } else {

                    autoCompleteValue!!.id = result.id
                    autoCompleteValue!!.label = result.nome
                    setTimeout(() => {
                      setIsLoading(false);
                      alert("Faculdade registrada com sucesso.")
                      handleCloseFaculdadeModal();
                    }, 2000);
                  }
                });

  };


  return (
    <div>
      <Autocomplete
        openText='Abrir'
        closeText='Fechar'
        noOptionsText='Sem opções'
        loadingText='Carregando...'

        disablePortal

        options={opcoes}
        loading={isLoading}
        disabled={isExternalLoading}
        value={autoCompleteValue?.label !== 'default' ? autoCompleteValue : null} 
        onInputChange={(_, newValue) => setBusca(newValue)}
        onChange={(_, newValue) => {

          if (newValue && newValue.id === -3) {
            handleOpenFaculdadeModal();
            setBusca('');
            clearError();
          }
          else if (newValue !== null) {
            setSelectedId(newValue?.id)
            
            autoCompleteValue!!.id = newValue.id
            autoCompleteValue!!.label = newValue.label

            setBusca('');
            clearError();
          } 
          
        }}
        popupIcon={(isExternalLoading || isLoading) ? <CircularProgress size={28} /> : undefined}
        renderInput={(params) => (
          <TextField
            {...params}

            label="Faculdade"
            error={!!error}
            helperText={error}
            sx={{ width: '500px' }}
          />
        )}
      />

      <Dialog open={isFaculdadeModalOpen} onClose={handleCloseFaculdadeModal} BackdropComponent={Backdrop}>
        <DialogTitle>Registrar Faculdade</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              fullWidth
              label="Nome"
              value={novaFaculdade}
              onChange={e => setNovaFaculdade(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', marginLeft: '20px', marginRight: '20px' }}
                onClick={handleSaveFaculdade}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="primary"
                autoFocus
                style={{ marginTop: '10px', marginLeft: '10px', marginRight: '20px' }}
                onClick={handleCloseFaculdadeModal}
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
    </div>
  );
};
