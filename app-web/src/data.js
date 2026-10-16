// Datos de prueba precargados (sin backend).
export const VALID_USER = { username: 'qa.senior', password: 'Liverpool123' };

export const PEDIDOS = [
  { id: '1001', fecha: '12 oct 2026', cliente: 'Ana Torres', producto: 'Televisor 55"', cantidad: 1, total: 12999, estado: 'Pendiente' },
  { id: '1002', fecha: '10 oct 2026', cliente: 'Luis Ramírez', producto: 'Laptop 14"', cantidad: 2, total: 31998, estado: 'Enviado' },
  { id: '1003', fecha: '07 oct 2026', cliente: 'María López', producto: 'Refrigerador', cantidad: 1, total: 18499, estado: 'Entregado' },
  { id: '1004', fecha: '05 oct 2026', cliente: 'Jorge Pérez', producto: 'Smartphone', cantidad: 3, total: 29997, estado: 'Pendiente' },
  { id: '1005', fecha: '01 oct 2026', cliente: 'Sofía Díaz', producto: 'Audífonos', cantidad: 4, total: 5196, estado: 'Enviado' },
];

// Tiempos simulados (ms). Deterministas para evitar flakiness.
export const SUBMIT_ENABLE_DELAY_MS = 3000;
export const PROMO_VISIBLE_MS = 3000;
export const PROMO_HIDDEN_MS = 4000;
