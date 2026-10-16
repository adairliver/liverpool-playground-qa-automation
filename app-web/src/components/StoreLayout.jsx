import React from 'react';
import AnnouncementBar from './AnnouncementBar.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function StoreLayout({ children }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <div className="page">
        <main className="container">{children}</main>
      </div>
      <Footer />
    </>
  );
}
