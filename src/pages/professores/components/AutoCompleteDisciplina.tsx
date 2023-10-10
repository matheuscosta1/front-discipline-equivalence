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
}

export const AutoCompleteDisciplina: React.FC<IAutoCompleteCursoProps> = ({
  isExternalLoading = false,
  faculdadeId,
  cursoId,
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
      getValue: () => selectedId,
      setValue: (_, newSelectedId) => setSelectedId(newSelectedId),
    });
  }, [registerField, fieldName, selectedId]);

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      console.log("Teste");
      // Utilize faculdadeId diretamente na chamada da API
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

          label="Disciplina"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};
