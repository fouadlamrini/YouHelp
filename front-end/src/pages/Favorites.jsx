import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";

const dummyFavoritePosts = [
  { title: "Problème React", description: "Cannot use state properly", tags: ["React", "JS"], status: "non-solved" },
];

const dummyFavoriteKnowledge = [
  { title: "React Hooks Guide", description: "UseEffect & UseState explained", author: "Sara", category: "React" },
];

const Favorite = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Veuillez vous connecter pour accéder aux favoris.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Favorites</h1>

        <h2 className="text-xl font-bold mb-4">Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {dummyFavoritePosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">Knowledge</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyFavoriteKnowledge.map((kn, index) => (
            <KnowledgeCard key={index} {...kn} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Favorite;
