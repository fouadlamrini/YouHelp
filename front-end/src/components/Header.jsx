import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-slate-800 text-white py-4 shadow-md">
      <div className="max-w-6xl mx-auto px-5 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-white hover:text-blue-400 transition-colors">
          YouHelp
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-8">
            <li>
              <Link to="/" className="text-white hover:text-blue-400 transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-white hover:text-blue-400 transition-colors">
                À propos
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="text-blue-300">
                  Bonjour, {user?.name}
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-white hover:text-blue-400 transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;