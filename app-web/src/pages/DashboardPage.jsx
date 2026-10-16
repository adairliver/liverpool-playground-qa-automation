import React, { useEffect, useState } from 'react';
import StoreLayout from '../components/StoreLayout.jsx';
import Icon from '../components/Icon.jsx';
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
    <StoreLayout>
      <h1 id="dashboard-title" className="dash-title">Dashboard de pedidos</h1>
      <div className="promo-slot">
        {promoVisible && (
          <div id="promo-banner" className="promo">
            <Icon name="local_offer" />
            Promoción: 20% de descuento en electrónica
          </div>
        )}
      </div>
      <nav className="tiles">
        <a id="nuevo-pedido-link" className="tile" href="/pedidos/nuevo">
          <Icon name="add_shopping_cart" />
          <strong>Nuevo pedido</strong>
          <span className="desc">Registra un pedido para un cliente</span>
        </a>
        <a id="pedidos-link" className="tile" href="/pedidos">
          <Icon name="inventory_2" />
          <strong>Ver pedidos</strong>
          <span className="desc">Consulta tus compras y su estatus</span>
        </a>
        <a id="open-report" className="tile" href="/reporte" target="_blank" rel="opener">
          <Icon name="assessment" />
          <strong>Abrir reporte</strong>
          <span className="desc">Se abre en una pestaña nueva</span>
        </a>
      </nav>
    </StoreLayout>
  );
}
