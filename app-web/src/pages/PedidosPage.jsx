import React, { useState } from 'react';
import { PEDIDOS } from '../data.js';

export default function PedidosPage() {
  const [selected, setSelected] = useState(null);

  return (
    <main className="card wide">
      <h1>Pedidos</h1>
      <table id="pedidos-table">
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {PEDIDOS.map((p) => (
            <tr key={p.id} data-id={p.id} className={selected === p.id ? 'selected' : ''} onClick={() => setSelected(p.id)}>
              <td>{p.id}</td><td>{p.cliente}</td><td>{p.producto}</td><td>{p.cantidad}</td><td>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && <p id="row-detail" className="ok">Pedido {selected} seleccionado</p>}
      <a href="/dashboard">Volver al dashboard</a>
    </main>
  );
}
