import React from 'react';

const About = () => {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Section principale */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            marginBottom: '2rem' 
          }}>
            À propos de YouHelp
          </h1>
          
          <p style={{ 
            fontSize: '1.3rem', 
            color: '#666', 
            lineHeight: '1.8',
            marginBottom: '3rem' 
          }}>
            YouHelp est une plateforme d'entraide étudiante conçue pour connecter les étudiants 
            et faciliter le partage de connaissances dans un environnement collaboratif.
          </p>
        </div>
      </section>

      {/* Section Mission */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#2c3e50', 
            marginBottom: '3rem' 
          }}>
            Notre Mission
          </h2>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '2rem',
            borderRadius: '15px'
          }}>
            <p style={{ 
              color: '#333', 
              marginBottom: '1.5rem',
              fontSize: '1.1rem' 
            }}>
              Notre mission est de créer un écosystème éducatif où chaque étudiant peut :
            </p>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              fontSize: '1.1rem',
              color: '#333'
            }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <span style={{ color: '#3498db', marginRight: '10px', fontSize: '1.2rem' }}>✓</span>
                Poser des questions et obtenir de l'aide rapidement
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <span style={{ color: '#3498db', marginRight: '10px', fontSize: '1.2rem' }}>✓</span>
                Partager ses connaissances avec d'autres étudiants
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <span style={{ color: '#3498db', marginRight: '10px', fontSize: '1.2rem' }}>✓</span>
                Accéder à des ressources pédagogiques de qualité
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <span style={{ color: '#3498db', marginRight: '10px', fontSize: '1.2rem' }}>✓</span>
                Collaborer sur des projets académiques
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <span style={{ color: '#3498db', marginRight: '10px', fontSize: '1.2rem' }}>✓</span>
                Développer ses compétences grâce à l'entraide
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#2c3e50', 
            marginBottom: '3rem' 
          }}>
            Fonctionnalités Principales
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Posts et Questions
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Posez vos questions académiques, partagez vos difficultés et obtenez 
                des réponses de la communauté étudiante.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Base de Connaissances
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Accédez à une bibliothèque de ressources partagées par les étudiants 
                et les formateurs, incluant cours, tutoriels et exemples de code.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Système de Commentaires
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Participez aux discussions, apportez des précisions et enrichissez 
                les conversations avec vos commentaires.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Réactions et Favoris
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Réagissez aux posts qui vous plaisent et sauvegardez vos contenus 
                préférés dans vos favoris pour les retrouver facilement.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Appels Vidéo
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Organisez des sessions d'étude en groupe ou des séances de tutorat 
                grâce à notre système d'appels vidéo intégré.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📨</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Messagerie
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Communiquez directement avec d'autres étudiants via notre système 
                de messagerie privée pour des échanges plus personnalisés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Rôles */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#2c3e50', 
            marginBottom: '3rem' 
          }}>
            Rôles et Permissions
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🎓</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: '#3498db', 
                marginBottom: '1rem' 
              }}>
                Étudiant
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Posez des questions, partagez vos connaissances, participez aux discussions 
                et collaborez avec d'autres étudiants.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: '#27ae60', 
                marginBottom: '1rem' 
              }}>
                Formateur
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Partagez votre expertise, répondez aux questions des étudiants et 
                contribuez à l'enrichissement de la base de connaissances.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#f3e5f5',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: '#9b59b6', 
                marginBottom: '1rem' 
              }}>
                Utilisateur Connecté
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Accès de base à la plateforme avec possibilité de consulter les contenus 
                et de participer aux discussions.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#ffeaa7',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: '#f39c12', 
                marginBottom: '1rem' 
              }}>
                Administrateur
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Gestion complète de la plateforme, modération des contenus et 
                administration des utilisateurs et des catégories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section style={{ padding: '60px 20px', backgroundColor: '#2c3e50' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '2rem' 
          }}>
            Nous Contacter
          </h2>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '15px'
          }}>
            <p style={{ 
              color: '#666', 
              marginBottom: '2rem',
              fontSize: '1.1rem' 
            }}>
              Vous avez des questions, des suggestions ou besoin d'aide ? 
              N'hésitez pas à nous contacter !
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '3rem',
              flexWrap: 'wrap' 
            }}>
              <div>
                <p style={{ color: '#333', fontSize: '1.1rem' }}>
                  <strong>Email :</strong> contact@youhelp.com
                </p>
              </div>
              <div>
                <p style={{ color: '#333', fontSize: '1.1rem' }}>
                  <strong>Support :</strong> support@youhelp.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;