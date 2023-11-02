import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { DashboardProfessor } from '../pages/dashboard/DashboardProfessor';

import { useDrawerContext } from '../shared/contexts';
import {
  Dashboard,
  DetalheDeFaculdades,
  ListagemDeFaculdades,
  DetalheDeCursos,
  ListagemDeCursos,
  ListagemDeDisciplinas,
  DetalheDeDisciplinas,
  ListagemDeProfessores,
  DetalheDeProfessores,
  ListagemDeAlocacaoAnalisesProfessores, 
  DetalheDeAlocacaoAnalisesProfessores,
  ListagemDeEquivalencias,
  ListagemDeAnalisesPendentesDoProfessor,
  ListagemDeAlocacaoAnalisesProfessoresPendente
} from '../pages';
import { ListagemDeAnalisesDoProfessor } from '../pages/analises_professor/ListagemDeAnalisesDoProfessor';
import { ListagemRelatorioEquivalencia } from '../pages/analises_professor/ListagemRelatorioEquivalencia';


export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

  const adminItems = [
    {
      icon: 'home',
      path: '/pagina-inicial',
      label: 'Página inicial',
    },
    {
      icon: 'school',
      path: '/equivalencias',
      label: 'Equivalências',
    },

    {
      icon: 'school',
      path: '/analises',
      label: 'Análises de equivalência',
    },
    {
      icon: 'school',
      path: '/faculdades',
      label: 'Faculdades',
    },
    {
      icon: 'school',
      path: '/cursos',
      label: 'Cursos',
    },
    {
      icon: 'school',
      path: '/disciplinas',
      label: 'Disciplinas',
    },
    {
      icon: 'school',
      path: '/professores',
      label: 'Professores',
    }
  ];

  const professorItems = [
    {
      icon: 'home',
      path: '/pagina-inicial',
      label: 'Análises de equivalência pendentes',
    },
    { 
      icon: 'school',
      path: '/analises-professor',
      label: 'Histórico de análises de equivalência',
    }
  ];


  useEffect(() => {
    setDrawerOptions(verifyIsProfessorRole() ? professorItems : adminItems);
  }, []);

  const rotasSecretario = (
    <Routes>
      <Route path="/pagina-inicial" element={<ListagemDeAlocacaoAnalisesProfessoresPendente />} />

      {/* <Route path="/pessoas" element={<ListagemDePessoas />} />
      <Route path="/pessoas/detalhe/:id" element={<DetalheDePessoas />} /> */}

      <Route path="/faculdades" element={<ListagemDeFaculdades />} />
      <Route path="/faculdades/detalhe/:id" element={<DetalheDeFaculdades />} />

      <Route path="/cursos" element={<ListagemDeCursos />} />
      <Route path="/cursos/detalhe/:id" element={<DetalheDeCursos />} />

      <Route path="/disciplinas" element={<ListagemDeDisciplinas />} />
      <Route path="/disciplinas/detalhe/:id" element={<DetalheDeDisciplinas />} />

      <Route path="/professores" element={<ListagemDeProfessores />} />
      <Route path="/professores/detalhe/:id" element={<DetalheDeProfessores />} />

      <Route path="/analises" element={<ListagemDeAlocacaoAnalisesProfessores />} />
      <Route path="/analises/detalhe/:id" element={<DetalheDeAlocacaoAnalisesProfessores />} />

      <Route path="/equivalencias" element={<ListagemDeEquivalencias />} />
      <Route path="/equivalencias/detalhe/:id" element={<DetalheDeAlocacaoAnalisesProfessores />} />

      <Route path="*" element={<Navigate to="/pagina-inicial" />} />
    </Routes>
  );

  const rotasProfessor = (
    <Routes>
      <Route path="/pagina-inicial" element={verifyIsProfessorRole() ? <ListagemDeAnalisesPendentesDoProfessor /> : <ListagemDeEquivalencias />} />

      <Route path="/analises-professor" element={<ListagemDeAnalisesDoProfessor />} />
      <Route path="/analises-professor/detalhe/:id" element={<ListagemRelatorioEquivalencia />} />

      <Route path="*" element={<Navigate to="/pagina-inicial" />} />
    </Routes>
  );

  return verifyIsProfessorRole() ? rotasProfessor : rotasSecretario ; 
};

interface DecodedToken {
  sub: string;
  exp: number;
  roles: string[]; 
}

function verifyIsProfessorRole() {
  
  const token = localStorage.getItem('APP_ACCESS_TOKEN');

  
  if (token) {
    try {
      
      const decodedToken: DecodedToken = jwt_decode(token);

      
      if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
        
        if (decodedToken.roles.includes('ROLE_PROFESSOR')) {
          
          return 'ROLE_PROFESSOR';
        }
      }
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
    }
  }

  
  return null;
}

