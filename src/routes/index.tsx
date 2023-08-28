import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useDrawerContext } from '../shared/contexts';
import {
  Dashboard,
  DetalheDePessoas,
  ListagemDePessoas,
  DetalheDeFaculdades,
  ListagemDeFaculdades,
  DetalheDeCursos,
  ListagemDeCursos,
  ListagemDeDisciplinas,
  DetalheDeDisciplinas
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
        label: 'Faculdades',
      },
      // {
      //   icon: 'people',
      //   path: '/pessoas',
      //   label: 'Pessoas',
      // },
      {
        icon: 'location_city',
        path: '/cursos',
        label: 'Cursos',
      },
      {
        icon: 'location_city',
        path: '/disciplinas',
        label: 'Disciplinas',
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

      <Route path="*" element={<Navigate to="/pagina-inicial" />} />
    </Routes>
  );
};
