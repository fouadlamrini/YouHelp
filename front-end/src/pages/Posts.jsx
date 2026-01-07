import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";

const dummyPosts = [
  { title: "Problème React", description: "Cannot use state properly", tags: ["React", "JS"], status: "non-solved" },
  { title: "Bug Node.js", description: "Server crash on API call", tags: ["Node", "Express"], status: "solved" },
];

const Post = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Veuillez vous connecter pour accéder aux posts.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Post;
