import React, { useState } from 'react';
import StoreLayout from '../components/StoreLayout.jsx';
import Icon from '../components/Icon.jsx';
import { PEDIDOS } from '../data.js';

const CHIP = { Pendiente: 'pending', Enviado: 'shipped', Entregado: 'delivered' };
const money = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function PedidosPage() {
  const [selected, setSelected] = useState(null);

  return (
    <StoreLayout>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/dashboard">Home</a>
        <Icon name="chevron_right" small />
        <span>Mis compras</span>
      </nav>
      <div className="orders-head">
        <h1>Mis compras</h1>
        <div className="orders-search">
          <Icon name="search" />
          <input id="orders-search-input" type="text" placeholder="Buscar por número de pedido"
            aria-label="Buscar por número de pedido" autoComplete="off" />
        </div>
      </div>
      <div className="tabs" role="tablist">
        <button type="button" className="tab active" role="tab" aria-selected="true">Todas</button>
        <button type="button" className="tab" role="tab" aria-selected="false" aria-disabled="true">En línea</button>
        <button type="button" className="tab" role="tab" aria-selected="false" aria-disabled="true">En tienda</button>
      </div>
      <div className="orders-card">
        <table id="pedidos-table">
          <thead>
            <tr>
              <th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Total</th><th>Estatus</th><th />
            </tr>
          </thead>
          <tbody>
            {PEDIDOS.map((p) => (
              <tr key={p.id} data-id={p.id} className={selected === p.id ? 'selected' : ''} onClick={() => setSelected(p.id)}>
                <td className="order-id">{p.id}</td>
                <td>{p.fecha}</td>
                <td>{p.cliente}</td>
                <td>{p.producto}</td>
                <td>{p.cantidad}</td>
                <td className="total">{money(p.total)}</td>
                <td><span className={`chip ${CHIP[p.estado]}`}>{p.estado}</span></td>
                <td className="chev"><Icon name="chevron_right" small /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="detail">
          <Icon name="check_circle" />
          <p id="row-detail">Pedido {selected} seleccionado</p>
        </div>
      )}
      <a className="back-link" href="/dashboard">Volver al dashboard</a>
    </StoreLayout>
  );
}
