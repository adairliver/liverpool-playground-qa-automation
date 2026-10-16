import React from 'react';
import Icon from './Icon.jsx';

// Control decorativo: no navega, no abre pestanas y no usa identificadores reservados.
export default function Deco({ icon, children, trailing, bold = false, label }) {
  return (
    <button
      type="button"
      className={`deco${bold ? ' bold' : ''}`}
      aria-disabled="true"
      aria-label={label}
      title="Demostración"
    >
      {icon && <Icon name={icon} />}
      {children}
      {trailing && <Icon name={trailing} small />}
    </button>
  );
}
