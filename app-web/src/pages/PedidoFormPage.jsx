import React, { useEffect, useState } from 'react';
import StoreLayout from '../components/StoreLayout.jsx';
import FloatingField from '../components/FloatingField.jsx';
import Icon from '../components/Icon.jsx';
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
    <StoreLayout>
      <div className="card form-card">
        <h1>Registrar pedido</h1>
        <p className="lead">Captura los datos del pedido. El botón se habilita en unos segundos.</p>
        <form onSubmit={onSubmit} noValidate>
          <FloatingField id="cliente" label="Cliente" required value={cliente} onChange={(e) => setCliente(e.target.value)} />
          <FloatingField id="producto" label="Producto" required value={producto} onChange={(e) => setProducto(e.target.value)} />
          <FloatingField id="cantidad" type="number" min="1" label="Cantidad" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          <button id="submit-form" className="btn-primary" type="submit" disabled={!ready}>Enviar pedido</button>
        </form>
        {confirmation && (
          <div className="confirm">
            <Icon name="check_circle" />
            <p id="order-confirmation">{confirmation}</p>
          </div>
        )}
        <a className="back-link" href="/dashboard">Volver al dashboard</a>
      </div>
    </StoreLayout>
  );
}
