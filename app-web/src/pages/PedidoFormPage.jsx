import React, { useEffect, useState } from 'react';
import { SUBMIT_ENABLE_DELAY_MS } from '../data.js';

export default function PedidoFormPage() {
  const [ready, setReady] = useState(false);
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setReady(true), SUBMIT_ENABLE_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setConfirmation(`Pedido registrado para ${cliente}`);
  };

  return (
    <main className="card">
      <h1>Alta de pedido</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="cliente">Cliente</label>
        <input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        <label htmlFor="producto">Producto</label>
        <input id="producto" value={producto} onChange={(e) => setProducto(e.target.value)} />
        <label htmlFor="cantidad">Cantidad</label>
        <input id="cantidad" type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
        <button id="submit-form" type="submit" disabled={!ready}>Enviar pedido</button>
      </form>
      {confirmation && <p id="order-confirmation" className="ok">{confirmation}</p>}
      <a href="/dashboard">Volver al dashboard</a>
    </main>
  );
}
