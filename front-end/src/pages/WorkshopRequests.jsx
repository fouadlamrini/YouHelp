import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const dummyRequests = [
  { Student: "Youssef", Topic: "React Hooks", RequestedDate: "2026-01-10", Status: "Pending" },
  { Student: "Sara", Topic: "Node.js API", RequestedDate: "2026-01-12", Status: "Pending" },
];

const WorkshopRequests = ({ user }) => {
  if (!user || user.role !== "formateur") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Accès refusé. Vous devez être Formateur.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Workshop Requests</h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyRequests.map((req, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{req.Student}</td>
                  <td className="px-6 py-4">{req.Topic}</td>
                  <td className="px-6 py-4">{req.RequestedDate}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Accept</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                  </td>
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

export default WorkshopRequests;
