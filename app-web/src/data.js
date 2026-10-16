// Datos de prueba precargados (sin backend).
export const VALID_USER = { username: 'qa.senior', password: 'Liverpool123' };

export const PEDIDOS = [
  { id: '1001', cliente: 'Ana Torres', producto: 'Televisor 55"', cantidad: 1, estado: 'Pendiente' },
  { id: '1002', cliente: 'Luis Ramírez', producto: 'Laptop 14"', cantidad: 2, estado: 'Enviado' },
  { id: '1003', cliente: 'María López', producto: 'Refrigerador', cantidad: 1, estado: 'Entregado' },
  { id: '1004', cliente: 'Jorge Pérez', producto: 'Smartphone', cantidad: 3, estado: 'Pendiente' },
  { id: '1005', cliente: 'Sofía Díaz', producto: 'Audífonos', cantidad: 4, estado: 'Enviado' },
];

// Tiempos simulados (ms). Deterministas para evitar flakiness.
export const SUBMIT_ENABLE_DELAY_MS = 3000;
export const PROMO_VISIBLE_MS = 3000;
export const PROMO_HIDDEN_MS = 4000;
