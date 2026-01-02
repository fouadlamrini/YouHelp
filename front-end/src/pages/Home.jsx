import React from 'react';

const Home = () => {
  return (
    <div>
      {/* Section Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-slate-800 text-white text-center py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue sur YouHelp
          </h1>
          <p className="text-xl mb-8">
            La plateforme d'entraide étudiante qui connecte les étudiants
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Rejoindre maintenant
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir YouHelp ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Entraide
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Posez vos questions et aidez d'autres étudiants dans leurs études
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Partage de connaissances
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Partagez vos ressources, cours et expériences avec la communauté
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Communication
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Échangez via messages et appels vidéo avec d'autres étudiants
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Favoris
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sauvegardez les posts et connaissances qui vous intéressent
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Catégories
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Trouvez facilement l'aide dont vous avez besoin par domaine d'étude
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                Communauté
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Rejoignez une communauté active d'étudiants et de formateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            YouHelp en chiffres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <h3 className="text-5xl font-bold text-blue-600 mb-2">
                1000+
              </h3>
              <p className="text-gray-600 text-lg">Étudiants inscrits</p>
            </div>

            <div className="bg-green-50 p-8 rounded-lg text-center">
              <h3 className="text-5xl font-bold text-green-600 mb-2">
                500+
              </h3>
              <p className="text-gray-600 text-lg">Questions résolues</p>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg text-center">
              <h3 className="text-5xl font-bold text-purple-600 mb-2">
                50+
              </h3>
              <p className="text-gray-600 text-lg">Formateurs experts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;