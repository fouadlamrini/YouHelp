import React from "react";
import PostCard from "../components/PostCard";

const dummyPosts = [
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
  {
    title: "Bug Node.js",
    content: "Server crash on API call due to unhandled promise rejection",
    author: "Fatima",
    isSolved: true,
    tags: ["Node", "Express"],
    category: "Backend",
    subCategory: "Node.js",
    media: [],
    reactionCount: 10,
    shareCount: 5,
    commentsCount: 7,
  },
];

const Post = () => {
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
     
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;
