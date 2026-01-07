import React from "react";

const KnowledgeCard = ({ title, description, author, category }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700 mb-2">{description}</p>
      <p className="text-gray-500 text-sm mb-2">Author: {author}</p>
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{category}</span>
    </div>
  );
};
 
export default KnowledgeCard;
