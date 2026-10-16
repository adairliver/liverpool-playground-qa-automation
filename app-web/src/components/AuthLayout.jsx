import React from 'react';
import Footer from './Footer.jsx';

export default function AuthLayout({ children }) {
  return (
    <>
      <header className="auth-header">
        <span className="wordmark">Liverpool</span>
      </header>
      <div className="page plain">{children}</div>
      <Footer />
    </>
  );
}
