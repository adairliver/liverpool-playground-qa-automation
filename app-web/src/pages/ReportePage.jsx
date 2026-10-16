import React from 'react';
import { PEDIDOS } from '../data.js';

export const REPORT_TITLE = 'Reporte de Pedidos';

export default function ReportePage() {
  return (
    <main className="card">
      <h1 id="report-heading">{REPORT_TITLE}</h1>
      <p>Total de pedidos: {PEDIDOS.length}</p>
    </main>
  );
}
