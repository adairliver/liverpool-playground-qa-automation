import React from 'react';
import Deco from './Deco.jsx';
import Icon from './Icon.jsx';
import { isLoggedIn } from '../session.js';

export default function Header() {
  return (
    <header className="store-header">
      <div className="topbar">
        <div className="topbar-inner">
          <Deco icon="place">Elige una tienda</Deco>
          <Deco trailing="keyboard_arrow_down">Servicios</Deco>
          <Deco trailing="keyboard_arrow_down">Otros sitios</Deco>
          <Deco>Mesa de regalos</Deco>
          <Deco>Seguros</Deco>
          <Deco>Mi crédito</Deco>
        </div>
      </div>
      <div className="mainbar">
        <div className="mainbar-inner">
          <Deco icon="menu" bold>Categorías</Deco>
          <span className="wordmark">Liverpool</span>
          <div className="search">
            <Icon name="search" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar por producto, categoría y más..."
              aria-label="Buscar por producto, categoría y más..."
              autoComplete="off"
            />
          </div>
          <div className="header-actions">
            <Deco icon="account_circle" bold>{isLoggedIn() ? 'qa.senior' : 'Iniciar sesión'}</Deco>
            <Deco icon="favorite_border" label="Favoritos" />
            <Deco icon="shopping_bag" label="Bolsa" />
          </div>
        </div>
      </div>
    </header>
  );
}
