import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const dummySchedule = [
  { Student: "Youssef", Topic: "React Hooks", Date: "2026-01-10", Time: "10:00 AM" },
  { Student: "Sara", Topic: "Node.js API", Date: "2026-01-12", Time: "2:00 PM" },
];

const WorkshopSchedule = ({ user }) => {
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
        <h1 className="text-3xl font-bold mb-6">Workshop Schedule</h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummySchedule.map((ws, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{ws.Student}</td>
                  <td className="px-6 py-4">{ws.Topic}</td>
                  <td className="px-6 py-4">{ws.Date}</td>
                  <td className="px-6 py-4">{ws.Time}</td>
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

export default WorkshopSchedule;
