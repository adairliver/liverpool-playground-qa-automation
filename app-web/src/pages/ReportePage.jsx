import React from 'react';
import { PEDIDOS } from '../data.js';

export const REPORT_TITLE = 'Reporte de Pedidos';

// Vista independiente: sin header de tienda y sin requerir sesion.
export default function ReportePage() {
  return (
    <>
      <header className="auth-header">
        <span className="wordmark">Liverpool</span>
      </header>
      <div className="page plain">
        <main className="card report">
          <h1 id="report-heading">{REPORT_TITLE}</h1>
          <p>Total de pedidos: {PEDIDOS.length}</p>
        </main>
      </div>
    </>
  );
}
