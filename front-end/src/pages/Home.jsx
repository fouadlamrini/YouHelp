import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoleCard from "../components/RoleCard";
import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";

const dummyPosts = [
  { title: "Problème React", description: "Cannot use state properly", tags: ["React", "JS"], status: "non-solved" },
  { title: "Bug Node.js", description: "Server crash on API call", tags: ["Node", "Express"], status: "solved" },
];

const dummyKnowledge = [
  { title: "React Hooks Guide", description: "UseEffect & UseState explained", author: "Sara", category: "React" },
  { title: "Node Best Practices", description: "Organizing Express apps", author: "Ali", category: "Node" },
];

const Home = ({ user }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="text-center py-20 bg-blue-600 text-white">
        <h1 className="text-4xl font-bold mb-4">YouHelp</h1>
        <p className="text-lg mb-6">Plateforme de partage de problèmes et connaissances pour YouCode</p>
        <div className="space-x-4">
          <button className="bg-yellow-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-500">Explorer les posts</button>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-200">Rejoindre la communauté</button>
        </div>
      </section>

      {/* Roles Section */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold mb-10 text-center">Nos Rôles</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <RoleCard role="Etudiant" description="Poser des problèmes, aider les camarades, publier connaissance" />
          <RoleCard role="Formateur" description="Aider les étudiants, accepter workshops, publier connaissance" />
          <RoleCard role="Admin" description="Gérer utilisateurs, posts, knowledge et statistiques" />
          <RoleCard role="Connected" description="Lire posts, knowledge et ajouter à vos favoris" />
        </div>
      </section>

      {/* Sample Posts */}
      {user && (
        <section className="max-w-7xl mx-auto py-20 px-6">
          <h2 className="text-3xl font-bold mb-6">Posts récents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dummyPosts.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
          </div>
        </section>
      )}

      {/* Sample Knowledge */}
      {user && (
        <section className="max-w-7xl mx-auto py-20 px-6">
          <h2 className="text-3xl font-bold mb-6">Connaissances récentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dummyKnowledge.map((kn, index) => (
              <KnowledgeCard key={index} {...kn} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
