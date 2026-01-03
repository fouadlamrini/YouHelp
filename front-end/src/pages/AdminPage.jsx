import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
const { user } = useContext(AuthContext);

  // Example post
  const posts = [
    {
      id: 1,
      author: "Ahmed El Youssfi",
      role: "Etudiant",
      content: "J'ai un problème avec mon composant React, je n'arrive pas à mettre à jour le state correctement.",
      tags: ["#frontend", "#react"],
      image: "https://via.placeholder.com/600x300",
      likes: 12,
      questions: 3,
      comments: 5,
      shares: 2,
    },
    {
      id: 2,
      author: "fouad El king",
      role: "Etudiant",
      content: "J'ai un problème avecjavascript",
      tags: ["#frontend", "#react"],
      image: "https://via.placeholder.com/600x300",
      likes: 3,
      questions: 25,
      comments: 4,
      shares: 15,
    },
  ];

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-6 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Connected Dashboard</h1>
        <p className="text-lg">Welcome, {user?.name}!</p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-6">
            {/* Author */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h2 className="font-bold">{post.author}</h2>
                <p className="text-gray-500 text-sm">{post.role}</p>
              </div>
            </div>

            {/* Content */}
            <p className="mb-2 text-gray-700">{post.content}</p>

            {/* Tags */}
            <div className="mb-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-2"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Image */}
            <img
              src={post.image}
              alt="Post"
              className="w-full rounded-lg mb-4 object-cover"
            />

            {/* Reactions */}
            <div className="flex justify-between text-gray-600">
              <button className="flex items-center gap-1 hover:text-yellow-500">
                ❓ {post.questions}
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500">
                💬 {post.comments}
              </button>
              <button className="flex items-center gap-1 hover:text-green-500">
                🔄 {post.shares}
              </button>
              <button className="flex items-center gap-1 hover:text-red-500">
                ❤️ {post.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
