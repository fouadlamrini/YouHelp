import React from 'react';
import { Link } from 'react-router-dom';

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
        <Link to="/" style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          margin: 0,
          color: 'white',
          textDecoration: 'none'
        }}>
          YouHelp
        </Link>
        
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
              <Link to="/" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/about" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}>
                À propos
              </Link>
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
              <Link to="/register" style={{
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Inscription
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;