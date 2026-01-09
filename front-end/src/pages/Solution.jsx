import React from "react";


import PostCard from "../components/PostCard";

const dummySolutions = [
  { title: "Fix React State Issue", description: "Use useState correctly", author: "Sara", status: "solved" },
];

const Solution = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
     
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Solution Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummySolutions.map((sol, index) => (
            <PostCard key={index} {...sol} />
          ))}
        </div>
      </div>
   
    </div>
  );
};

export default Solution;
