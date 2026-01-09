import React from "react";

import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";

const dummyFavoritePosts = [
  {
    title: "Problème React",
    content: "Cannot use state properly in functional components",
    author: "Ahmed",
    isSolved: false,
    tags: ["React", "JS"],
    category: "Frontend",
    subCategory: "React",
    media: [{ url: "https://via.placeholder.com/300", type: "image" }],
    reactionCount: 5,
    shareCount: 2,
    commentsCount: 3,
  },
];

const dummyFavoriteKnowledge = [
  { title: "React Hooks Guide", description: "UseEffect & UseState explained", author: "Sara", category: "React" },
];

const Favorite = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    

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

     
    </div>
  );
};

export default Favorite;
