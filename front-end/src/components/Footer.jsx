import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      textAlign: 'center',
      padding: '2rem 0',
      marginTop: '3rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          &copy; 2024 YouHelp. Tous droits réservés.
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
          Plateforme d'entraide étudiante développée avec ❤️
        </p>
      </div>
    </footer>
  );
};

export default Footer;