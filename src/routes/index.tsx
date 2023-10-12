import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useDrawerContext } from '../shared/contexts';
import {
  Dashboard,
  DetalheDeFaculdades,
  ListagemDeFaculdades,
  DetalheDeCursos,
  ListagemDeCursos,
  ListagemDeDisciplinas,
  DetalheDeDisciplinas,
  ListagemDeRegistroEquivalencia,
  DetalheDeRegistroEquivalencia,
  ListagemDeProfessores,
  DetalheDeProfessores,
  ListagemDeAlocacaoAnalisesProfessores, 
  DetalheDeAlocacaoAnalisesProfessores
} from '../pages';

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

  useEffect(() => {
    setDrawerOptions([
      {
        icon: 'home',
        path: '/pagina-inicial',
        label: 'Página inicial',
      },
      {
        icon: 'location_city',
        path: '/faculdades',
        label: 'Faculdades - Persona Secretário',
      },
      // {
      //   icon: 'people',
      //   path: '/pessoas',
      //   label: 'Pessoas',
      // },
      {
        icon: 'location_city',
        path: '/cursos',
        label: 'Cursos - Persona Secretário',
      },
      {
        icon: 'location_city',
        path: '/disciplinas',
        label: 'Disciplinas - Persona Secretário ',
      },
      {
        icon: 'location_city',
        path: '/registro_equivalencia',
        label: 'Registra equivalência - Persona Secretário',
      },
      {
        icon: 'location_city',
        path: '/professores',
        label: 'Registro professores - Persona Secretário',
      },
      {
        icon: 'location_city',
        path: '/analises',
        label: 'Registro alocacao analises professores - Persona Secretário',
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route path="/pagina-inicial" element={<Dashboard />} />

      {/* <Route path="/pessoas" element={<ListagemDePessoas />} />
      <Route path="/pessoas/detalhe/:id" element={<DetalheDePessoas />} /> */}

      <Route path="/faculdades" element={<ListagemDeFaculdades />} />
      <Route path="/faculdades/detalhe/:id" element={<DetalheDeFaculdades />} />

      <Route path="/cursos" element={<ListagemDeCursos />} />
      <Route path="/cursos/detalhe/:id" element={<DetalheDeCursos />} />

      <Route path="/disciplinas" element={<ListagemDeDisciplinas />} />
      <Route path="/disciplinas/detalhe/:id" element={<DetalheDeDisciplinas />} />

      <Route path="/registro_equivalencia" element={<ListagemDeRegistroEquivalencia />} />
      <Route path="/registro_equivalencia/detalhe/:id" element={<DetalheDeRegistroEquivalencia />} />

      <Route path="/professores" element={<ListagemDeProfessores />} />
      <Route path="/professores/detalhe/:id" element={<DetalheDeProfessores />} />

      <Route path="/analises" element={<ListagemDeAlocacaoAnalisesProfessores />} />
      <Route path="/analises/detalhe/:id" element={<DetalheDeAlocacaoAnalisesProfessores />} />

      <Route path="*" element={<Navigate to="/pagina-inicial" />} />
    </Routes>
  );
};
