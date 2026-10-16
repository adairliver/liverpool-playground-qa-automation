import React from 'react';

const COLUMNS = [
  { title: 'Soporte al cliente', items: ['Facturación', 'Ayuda', 'Mis compras', 'Personas desaparecidas'] },
  { title: 'Servicios Liverpool', items: ['Crédito', 'Tiempo aire', 'Concursos y promociones', 'Diseño de interiores', 'Ventas corporativas'] },
  { title: 'Acerca de Liverpool', items: ['Bolsa de Trabajo', '¿Quiénes somos?', 'Relación con inversionistas', 'Sostenibilidad'] },
  { title: 'Promociones', items: ['Venta Nocturna', 'Hot Sale', 'Buen Fin', 'Bolo Fest'] },
];

// Texto inerte (sin href): el footer no agrega enlaces ni pestanas nuevas.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <ul>
              {c.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-sales">Ventas por teléfono 55 0000 0000 (número ficticio de demostración)</div>
      <div className="footer-bottom">
        <p>Sitio de demostración, no es una tienda real. Proyecto de práctica de QA Automation.</p>
      </div>
    </footer>
  );
}
