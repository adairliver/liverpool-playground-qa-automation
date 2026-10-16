import React from 'react';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PedidoFormPage from './pages/PedidoFormPage.jsx';
import PedidosPage from './pages/PedidosPage.jsx';
import ReportePage from './pages/ReportePage.jsx';
import { isLoggedIn } from './session.js';


// Cada navegacion es una carga de pagina completa (enlaces <a href>), sin router externo.
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/reporte') return <ReportePage />;
  if (path === '/') return <LoginPage />;

  if (!isLoggedIn()) {
    window.location.replace('/');
    return null;
  }

  switch (path) {
    case '/dashboard':
      return <DashboardPage />;
    case '/pedidos/nuevo':
      return <PedidoFormPage />;
    case '/pedidos':
      return <PedidosPage />;
    default:
      return <DashboardPage />;
  }
}
