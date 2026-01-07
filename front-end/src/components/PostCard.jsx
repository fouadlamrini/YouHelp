import React from "react";

const PostCard = ({ title, description, tags, status }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{tag}</span>
        ))}
      </div>
      <span className={`px-3 py-1 rounded-full text-white ${status === "solved" ? "bg-green-600" : "bg-red-600"}`}>
        {status}
      </span>
    </div>
  );
};

export default PostCard;
