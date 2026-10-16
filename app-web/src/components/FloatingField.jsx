import React, { useState } from 'react';
import Icon from './Icon.jsx';

// El id se asigna al <input> (nunca al contenedor) y el label usa htmlFor.
export default function FloatingField({ id, label, required = false, type = 'text', value, onChange, ...rest }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`ff${isPassword ? ' has-toggle' : ''}`}>
      <input
        id={id}
        name={id}
        type={isPassword && visible ? 'text' : type}
        value={value}
        onChange={onChange}
        placeholder=" "
        aria-required={required ? 'true' : undefined}
        {...rest}
      />
      <label htmlFor={id}>{required ? `${label}*` : label}</label>
      {isPassword && (
        <button
          type="button"
          id="toggle-password"
          className="toggle"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} />
        </button>
      )}
    </div>
  );
}
