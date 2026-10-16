import React, { useState } from 'react';
import { VALID_USER } from '../data.js';

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
    <main className="card">
      <h1>Iniciar sesión</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="username">Usuario</label>
        <input id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button id="login-button" type="submit">Entrar</button>
        {error && <p id="login-error" className="error">{error}</p>}
      </form>
    </main>
  );
}
