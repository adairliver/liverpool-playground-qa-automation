import React, { useEffect, useState } from 'react';
import { PROMO_HIDDEN_MS, PROMO_VISIBLE_MS } from '../data.js';

export default function DashboardPage() {
  const [promoVisible, setPromoVisible] = useState(true);


  // Banner intermitente: visible PROMO_VISIBLE_MS, oculto PROMO_HIDDEN_MS, en ciclo.
  useEffect(() => {
    let timer;
    const schedule = (visible) => {
      timer = setTimeout(() => {
        setPromoVisible(!visible);
        schedule(!visible);
      }, visible ? PROMO_VISIBLE_MS : PROMO_HIDDEN_MS);
    };
    schedule(true);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="card">
      <h1 id="dashboard-title">Dashboard de pedidos</h1>
      {promoVisible && (
        <div id="promo-banner" className="promo">🔥 Promoción: 20% de descuento en electrónica</div>
      )}
      <nav>
        <a id="nuevo-pedido-link" href="/pedidos/nuevo">Nuevo pedido</a>
        <a id="pedidos-link" href="/pedidos">Ver pedidos</a>
        <a id="open-report" href="/reporte" target="_blank" rel="opener">Abrir reporte</a>
      </nav>
    </main>
  );
}
