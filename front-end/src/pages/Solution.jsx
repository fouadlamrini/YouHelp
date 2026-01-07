import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";

const dummySolutions = [
  { title: "Fix React State Issue", description: "Use useState correctly", author: "Sara", status: "solved" },
];

const Solution = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Veuillez vous connecter pour voir les solutions.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Solution Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummySolutions.map((sol, index) => (
            <PostCard key={index} {...sol} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Solution;
