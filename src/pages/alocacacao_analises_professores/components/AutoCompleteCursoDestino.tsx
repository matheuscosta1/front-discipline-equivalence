import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { CursosService } from '../../../shared/services/api/cursos/CursosService';
import { useDebounce } from '../../../shared/hooks';
import { useField } from '@unform/core';

type TAutoCompleteOption = {
  id: number;
  label: string;
}

interface IAutoCompleteCursoProps {
  faculdadeId?: number | undefined;
  isExternalLoading?: boolean;
  onCursoIdChange?: (cursoId: number | undefined) => void; 
  disableField?: boolean;
  autoCompleteValue?: TAutoCompleteOption | null;
}

export const AutoCompleteCursoDestino: React.FC<IAutoCompleteCursoProps> = ({
  isExternalLoading = false,
  faculdadeId,
  onCursoIdChange,
  disableField = false,
  autoCompleteValue = null
}) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('cursoDestinoId');
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


  onCursoIdChange?.(selectedId); 

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      
      CursosService.getByFaculdadeId(0, busca, faculdadeId)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            
          } else {
            setOpcoes(result.content.map(curso => ({ id: curso.id, label: curso.nome })));
          }
        });
    });
  }, [busca, faculdadeId, debounce]);

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
      disabled={disableField ? disableField : isExternalLoading}
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
      }}      popupIcon={(isExternalLoading || isLoading) ? <CircularProgress size={28} /> : undefined}
      renderInput={(params) => (
        <TextField
          {...params}

          label="Curso destino"
          error={!!error}
          helperText={error}
          disabled={disableField}
          sx={{ width: '500px' }}
        />
      )}
    />
  );
};
