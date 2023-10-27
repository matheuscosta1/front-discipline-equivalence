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
  onDiscipinaDestinoIdChange?: (disciplinaDestinoId: number | undefined) => void; // Adicione este prop
  disableField?: boolean;
  autoCompleteValue?: TAutoCompleteOption;
}

export const AutoCompleteDisciplinaDestino: React.FC<IAutoCompleteCursoProps> = ({
  isExternalLoading = false,
  faculdadeId,
  cursoId,
  onDiscipinaDestinoIdChange,
  disableField = false,
  autoCompleteValue = undefined
}) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('disciplinaDestinoId');
  const { debounce } = useDebounce();

  const [selectedId, setSelectedId] = useState<number | undefined>(defaultValue);
  const [opcoes, setOpcoes] = useState<TAutoCompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busca, setBusca] = useState('');

  onDiscipinaDestinoIdChange?.(selectedId); // Chame a função de callback, se estiver definida

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
            setOpcoes(result.content.map(curso => ({ id: curso.id, label: curso.nome })));
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
      disabled={disableField ? disableField : isExternalLoading}
      value={autoCompleteValue !== undefined ? autoCompleteValue : autoCompleteSelectedOption}
      onInputChange={(_, newValue) => setBusca(newValue)}
      onChange={(_, newValue) => { setSelectedId(newValue?.id); setBusca(''); clearError(); }}
      popupIcon={(isExternalLoading || isLoading) ? <CircularProgress size={28} /> : undefined}
      renderInput={(params) => (
        <TextField
          {...params}

          label="Disciplina do curso de destino"
          error={!!error}
          helperText={error}
          disabled={disableField}
        />
      )}
    />
  );
};
