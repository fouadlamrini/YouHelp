import React from 'react';

const Header = () => {
  return (
    <header style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          YouHelp
        </h1>
        
        <nav>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: '2rem',
            margin: 0,
            padding: 0,
            alignItems: 'center'
          }}>
            <li>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                Accueil
              </a>
            </li>
            <li>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                À propos
              </a>
            </li>
            <li>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                Connexion
              </a>
            </li>
            <li>
              <button style={{
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
                Inscription
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;