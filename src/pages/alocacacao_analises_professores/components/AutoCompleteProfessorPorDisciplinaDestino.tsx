import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { ProfessoresService } from '../../../shared/services/api/professores/ProfessoresService';
import { useDebounce } from '../../../shared/hooks';
import { useField } from '@unform/core';
import { DeblurOutlined } from '@mui/icons-material';


type TAutoCompleteOption = {
  id: number;
  label: string;
}

interface IAutoCompleteProfessorPorDisciplinaDestinoProps {
  isExternalLoading?: boolean;
  disciplinaId?: number | undefined;
}
export const AutoCompleteProfessorPorDisciplinaDestino: React.FC<IAutoCompleteProfessorPorDisciplinaDestinoProps> = ({ isExternalLoading = false, disciplinaId}) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField('professorId');
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

  console.log("Disciplina destino: ", disciplinaId);

  console.log("Professor selecionado", selectedId);

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      ProfessoresService.getProfessoresByDisciplinaId(1, busca, disciplinaId)
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            // alert(result.message);
          } else {
            console.log(result);

            setOpcoes(result.data.map(professor => ({ id: professor.id, label: professor.nome })));
          }
        });
    });
  }, [busca, disciplinaId, debounce]);


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

          label="Professores analisadores do curso de destino"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};
