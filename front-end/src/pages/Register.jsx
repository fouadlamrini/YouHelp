import React from 'react';

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Inscription
        </h2>
        
        <form className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Entrez votre nom complet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Entrez votre email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-bold text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Entrez votre mot de passe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg text-base cursor-pointer mb-4 hover:bg-green-700 transition-colors"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Déjà inscrit ? 
          <a href="#" className="text-blue-600 hover:text-blue-500 ml-1">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;