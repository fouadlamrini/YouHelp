import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatCard from "../components/StatCard";

const dummyStats = [
  { title: "Total Posts", value: 12, icon: "📝" },
  { title: "Total Knowledge", value: 8, icon: "📚" },
  { title: "Reclamations", value: 2, icon: "⚠️" },
  { title: "Role Requests", value: 3, icon: "🙋" },
];

const Dashboard = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <p className="text-center py-20 text-gray-600">Veuillez vous connecter pour accéder au Dashboard.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard - {user.role}</h1>

        {/* Admin stats */}
        {user.role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {dummyStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

        {/* Connected / Etudiant / Formateur sections */}
        {user.role === "connected" && (
          <p className="text-gray-600">Vous pouvez lire posts et knowledge, ajouter aux favoris, et faire une demande de rôle.</p>
        )}

        {(user.role === "etudiant" || user.role === "formateur") && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Mes Posts & Knowledge</h2>
              <p className="text-gray-600">Voir vos posts et connaissances, créer/modifier, marquer comme solved, etc.</p>
            </div>
            {user.role === "formateur" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Gestion des Workshops</h2>
                <p className="text-gray-600">Accepter / Refuser les demandes de workshop, assigner sujet & rendez-vous.</p>
              </div>
            )}
          </>
        )}

        {/* Admin management links */}
        {user.role === "admin" && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/category-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">Category Management</a>
            <a href="/post-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">Post Management</a>
            <a href="/knowledge-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">Knowledge Management</a>
            <a href="/user-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">User Management</a>
            <a href="/request-role-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">Role Requests</a>
            <a href="/reclamation-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center">Reclamations</a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
