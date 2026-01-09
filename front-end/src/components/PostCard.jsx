import React from "react";

const PostCard = ({
  title,
  content,
  author,
  isSolved,
  tags,
  category,
  subCategory,
  media,
  reactionCount,
  shareCount,
  commentsCount,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700 mb-3">{content}</p>
      <p className="text-gray-500 text-sm mb-2">Author: {author}</p>
      <p className="text-gray-500 text-sm mb-2">
        Category: {category} {subCategory && `> ${subCategory}`}
      </p>
      {media && media.length > 0 && (
        <div className="mb-3">
          {media.map((m, index) => (
            <img
              key={index}
              src={m.url}
              alt="media"
              className="w-full h-32 object-cover rounded mb-2"
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center mb-3">
        <span
          className={`px-3 py-1 rounded-full text-white ${
            isSolved ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isSolved ? "Solved" : "Not Solved"}
        </span>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>👍 {reactionCount}</span>
          <span>🔗 {shareCount}</span>
          <span>💬 {commentsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
