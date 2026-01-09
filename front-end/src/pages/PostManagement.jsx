import React from "react";


const dummyPosts = [
  { Title: "Problème React", Author: "Youssef", Status: "non-solved" },
  { Title: "Bug Node.js", Author: "Sara", Status: "solved" },
];

const PostManagement = () => {
 

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Post Management</h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyPosts.map((post, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{post.Title}</td>
                  <td className="px-6 py-4">{post.Author}</td>
                  <td className="px-6 py-4">{post.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
   
    </div>
  );
};

export default PostManagement;
