import React from 'react';

// Los iconos son decorativos y nunca van dentro de elementos cuyo texto se compara en las pruebas.
export default function Icon({ name, small = false }) {
  return (
    <span className={`material-icons${small ? ' sm' : ''}`} aria-hidden="true">
      {name}
    </span>
  );
}
