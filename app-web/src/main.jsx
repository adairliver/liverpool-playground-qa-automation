import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'material-icons/iconfont/material-icons.css';
import App from './App.jsx';
import './styles.css';

// El titulo se define de forma sincrona (antes de renderizar) segun la ruta,
// de modo que document.readyState === 'complete' implica titulo ya asignado.
const TITLES = {
  '/': 'Login - Pedidos Playground',
  '/dashboard': 'Dashboard - Pedidos Playground',
  '/pedidos/nuevo': 'Nuevo pedido - Pedidos Playground',
  '/pedidos': 'Pedidos - Pedidos Playground',
  '/reporte': 'Reporte de Pedidos',
};
const path = window.location.pathname.replace(/\/+$/, '') || '/';
document.title = TITLES[path] || 'Pedidos Playground';

createRoot(document.getElementById('root')).render(<App />);
