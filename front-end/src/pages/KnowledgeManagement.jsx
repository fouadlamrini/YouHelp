import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const dummyKnowledge = [
  { Title: "React Hooks Guide", Author: "Sara", Category: "React" },
  { Title: "Node Best Practices", Author: "Ali", Category: "Node" },
];

const KnowledgeManagement = ({ user }) => {
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Accès refusé. Vous devez être admin.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Knowledge Management</h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyKnowledge.map((kn, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{kn.Title}</td>
                  <td className="px-6 py-4">{kn.Author}</td>
                  <td className="px-6 py-4">{kn.Category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KnowledgeManagement;
