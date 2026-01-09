import React from "react";
import { Link } from "react-router-dom";

import RoleCard from "../components/RoleCard";
import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";

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

const dummyKnowledge = [
  {
    title: "React Hooks Guide",
    description: "UseEffect & UseState explained",
    author: "Sara",
    category: "React",
  },
  {
    title: "Node Best Practices",
    description: "Organizing Express apps",
    author: "Ali",
    category: "Node",
  },
];

const Home = () => {
  return <h1>Home Page</h1>;
};

export default Home;
