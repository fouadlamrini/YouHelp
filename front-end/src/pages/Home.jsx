import React from 'react';

const Home = () => {
  return (
    <div>
      {/* Section Hero */}
      <section style={{ 
        background: 'linear-gradient(135deg, #3498db, #2c3e50)', 
        color: 'white', 
        textAlign: 'center', 
        padding: '80px 20px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Bienvenue sur YouHelp
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            La plateforme d'entraide étudiante qui connecte les étudiants
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              background: '#27ae60',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Rejoindre maintenant
            </button>
            <button style={{
              background: '#3498db',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '3rem', 
            fontSize: '2.5rem',
            color: '#2c3e50' 
          }}>
            Pourquoi choisir YouHelp ?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Entraide
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Posez vos questions et aidez d'autres étudiants dans leurs études
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Partage de connaissances
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Partagez vos ressources, cours et expériences avec la communauté
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Communication
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Échangez via messages et appels vidéo avec d'autres étudiants
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Favoris
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Sauvegardez les posts et connaissances qui vous intéressent
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Catégories
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Trouvez facilement l'aide dont vous avez besoin par domaine d'étude
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ color: '#3498db', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Communauté
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Rejoignez une communauté active d'étudiants et de formateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '3rem', 
            fontSize: '2.5rem',
            color: '#2c3e50' 
          }}>
            YouHelp en chiffres
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{
              background: '#e3f2fd',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '3rem', color: '#3498db', marginBottom: '0.5rem' }}>
                1000+
              </h3>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Étudiants inscrits</p>
            </div>

            <div style={{
              background: '#e8f5e8',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '0.5rem' }}>
                500+
              </h3>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Questions résolues</p>
            </div>

            <div style={{
              background: '#f3e5f5',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '3rem', color: '#9b59b6', marginBottom: '0.5rem' }}>
                50+
              </h3>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Formateurs experts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;