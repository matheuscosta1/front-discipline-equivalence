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
  isExternalLoading?: boolean;
}
export const AutoCompleteCurso: React.FC<IAutoCompleteCursoProps> = ({ isExternalLoading = false }) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('cursoId');
  const { debounce } = useDebounce();

  const [selectedId, setSelectedId] = useState<number | undefined>(defaultValue);

  const [opcoes, setOpcoes] = useState<TAutoCompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => selectedId,
      setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
    });
  }, [registerField, fieldName, selectedId]);

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      CursosService.getAll(1, busca)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            // alert(result.message);
          } else {
            console.log(result);

            setOpcoes(result.data.map(curso => ({ id: curso.id, label: curso.nome })));
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


  return (
    <Autocomplete
      openText='Abrir'
      closeText='Fechar'
      noOptionsText='Sem opções'
      loadingText='Carregando...'

      disablePortal

      options={opcoes}
      loading={isLoading}
      disabled={isExternalLoading}
      value={autoCompleteSelectedOption}
      onInputChange={(_, newValue) => setBusca(newValue)}
      onChange={(_, newValue) => { setSelectedId(newValue?.id); setBusca(''); clearError(); }}
      popupIcon={(isExternalLoading || isLoading) ? <CircularProgress size={28} /> : undefined}
      renderInput={(params) => (
        <TextField
          {...params}

          label="Curso"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};
