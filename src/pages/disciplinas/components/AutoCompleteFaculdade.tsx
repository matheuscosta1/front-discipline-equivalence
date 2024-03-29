import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { FaculdadesService } from '../../../shared/services/api/faculdades/FaculdadesService';
import { useDebounce } from '../../../shared/hooks';
import { useField } from '@unform/core';


type TAutoCompleteOption = {
  id: number;
  label: string;
}

interface IAutoCompleteFaculdadeProps {
  onFaculdadeIdChange?: (faculdadeId: number | undefined) => void; 
  isExternalLoading?: boolean;
  autoCompleteValue?: TAutoCompleteOption | null;
}
export const AutoCompleteFaculdade: React.FC<IAutoCompleteFaculdadeProps> = ({ isExternalLoading = false, onFaculdadeIdChange, autoCompleteValue=null }) => {
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
  }, [autoCompleteValue, fieldName, registerField, selectedId]);

  onFaculdadeIdChange?.(selectedId); 

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      FaculdadesService.getAll(0, busca)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            
          } else {
            

            setOpcoes(result.content.map(faculdade => ({ id: faculdade.id, label: faculdade.nome })));
          }
        });
    });
  }, [busca]);

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

  return (
    <Autocomplete
      openText='Abrir'
      closeText='Fechar'
      noOptionsText='Sem opções'
      loadingText='Carregando...'

      disablePortal

      options={opcoes}
      loading={isLoading}
      disabled={ isExternalLoading}
      value={autoCompleteValue?.label !== 'default' ? autoCompleteValue : null} 
      onInputChange={(_, newValue) => setBusca(newValue)}
      onChange={(_, newValue) => { 
        setSelectedId(newValue?.id)
        if(newValue !== null) {
          autoCompleteValue!!.id = newValue.id
          autoCompleteValue!!.label = newValue.label
        } 
        setBusca('');
        clearError(); 
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
  );
};
