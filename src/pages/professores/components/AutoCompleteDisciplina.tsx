import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { DisciplinasService } from '../../../shared/services/api/disciplinas/DisciplinasService';
import { useDebounce } from '../../../shared/hooks';
import { useField } from '@unform/core';

type TAutoCompleteOption = {
  id: number;
  label: string;
}

interface IAutoCompleteCursoProps {
  faculdadeId?: number | undefined;
  cursoId?: number | undefined;
  isExternalLoading?: boolean;
  autoCompleteValue?: TAutoCompleteOption | null;
}

export const AutoCompleteDisciplina: React.FC<IAutoCompleteCursoProps> = ({
  isExternalLoading = false,
  faculdadeId,
  cursoId,
  autoCompleteValue = null
}) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('disciplinaId');
  const { debounce } = useDebounce();

  const [selectedId, setSelectedId] = useState<number | undefined>(defaultValue);
  const [opcoes, setOpcoes] = useState<TAutoCompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busca, setBusca] = useState('')

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => autoCompleteValue!!.id,
      setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
    });
  }, [autoCompleteValue, fieldName, registerField, selectedId]);


  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      DisciplinasService.getAllDisciplinesByFaculdadeIdAndCursoId(0, busca, faculdadeId, cursoId)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            // Trate o erro aqui
          } else {
            console.log(result);
            setOpcoes(result.content.map(disciplina => ({ id: disciplina.id, label: disciplina.nome })));
          }
        });
    });
  }, [busca, faculdadeId, debounce, cursoId]);

  const autoCompleteSelectedOption = useMemo(() => {
    if (!selectedId) return null;

    console.log(selectedId);

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
      disabled={isExternalLoading}
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

          label="Disciplina"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};
