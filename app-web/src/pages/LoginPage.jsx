import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout.jsx';
import FloatingField from '../components/FloatingField.jsx';
import Icon from '../components/Icon.jsx';
import { VALID_USER } from '../data.js';

const inert = (e) => e.preventDefault(); // enlaces solo de presentacion

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (username === VALID_USER.username && password === VALID_USER.password) {
      sessionStorage.setItem('session', 'ok');
      window.location.assign('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <AuthLayout>
      <main className="card form-card">
        <h1>Inicia sesión</h1>
        <p className="lead">Recuerda que con una sola cuenta puedes ingresar a todas nuestras tiendas.</p>
        <form onSubmit={onSubmit} noValidate>
          <FloatingField id="username" label="Usuario o correo electrónico" required value={username}
            onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" />
          <FloatingField id="password" type="password" label="Contraseña" required value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {error && (
            <div className="error-box">
              <Icon name="error_outline" small />
              <span id="login-error">{error}</span>
            </div>
          )}
          <div className="link-row">
            <a href="#" onClick={inert}>¿Olvidaste tu contraseña?</a>
          </div>
          <button id="login-button" className="btn-primary" type="submit">Iniciar sesión</button>
        </form>
        <p className="link-center">¿No tienes cuenta? <a href="#" onClick={inert}>Crear cuenta</a></p>
      </main>
    </AuthLayout>
  );
}
