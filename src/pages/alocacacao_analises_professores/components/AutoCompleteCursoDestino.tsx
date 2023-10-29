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
  onCursoIdChange?: (cursoId: number | undefined) => void; // Adicione este prop
  disableField?: boolean;
  autoCompleteValue?: TAutoCompleteOption;
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
    if (autoCompleteValue) {
      registerField({
        name: fieldName,
        getValue: () => autoCompleteValue.id,
        setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
      });
    } else {
      registerField({
        name: fieldName,
        getValue: () => selectedId,
        setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
      });
    }
  }, [autoCompleteValue, fieldName, registerField, selectedId]);


  onCursoIdChange?.(selectedId); // Chame a função de callback, se estiver definida

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      // Utilize faculdadeId diretamente na chamada da API
      CursosService.getByFaculdadeId(0, busca, faculdadeId)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            // Trate o erro aqui
          } else {
            console.log(result);
            setOpcoes(result.content.map(curso => ({ id: curso.id, label: curso.nome })));
          }
        });
    });
  }, [busca, faculdadeId, debounce]);

  const autoCompleteSelectedOption = useMemo(() => {
    if (!selectedId) return null;

    console.log(selectedId);

    const selectedOption = opcoes.find(opcao => opcao.id === selectedId);
    if (!selectedOption) return null;

    return selectedOption;
  }, [selectedId, opcoes]);

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
      value={autoCompleteValue}      onInputChange={(_, newValue) => setBusca(newValue)}
      onChange={(_, newValue) => {
        setSelectedId(newValue?.id);
        setBusca('');
        clearError();
        if(autoCompleteValue !== null && newValue !== null) {
          autoCompleteValue.id = newValue.id
          autoCompleteValue.label = newValue.label

        }
      }}      popupIcon={(isExternalLoading || isLoading) ? <CircularProgress size={28} /> : undefined}
      renderInput={(params) => (
        <TextField
          {...params}

          label="Curso destino"
          error={!!error}
          helperText={error}
          disabled={disableField}
        />
      )}
    />
  );
};
