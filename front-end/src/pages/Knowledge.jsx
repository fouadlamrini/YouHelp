import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import KnowledgeCard from "../components/KnowledgeCard";

const dummyKnowledge = [
  { title: "React Hooks Guide", description: "UseEffect & UseState explained", author: "Sara", category: "React" },
  { title: "Node Best Practices", description: "Organizing Express apps", author: "Ali", category: "Node" },
];

const Knowledge = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Veuillez vous connecter pour accéder aux connaissances.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Knowledge</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyKnowledge.map((kn, index) => (
            <KnowledgeCard key={index} {...kn} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Knowledge;
