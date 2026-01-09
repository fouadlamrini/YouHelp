import React from "react";
import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";

const dummyStats = [
  { title: "Total Posts", value: 12, icon: "📝" },
  { title: "Total Knowledge", value: 8, icon: "📚" },
  { title: "Reclamations", value: 2, icon: "⚠️" },
  { title: "Role Requests", value: 3, icon: "🙋" },
];

const Dashboard = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
     

      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Admin stats */}
      
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {dummyStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        

        {/* Connected / Etudiant / Formateur sections */}
     
       
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Mes Posts & Knowledge</h2>
              <p className="text-gray-600">Voir vos posts et connaissances, créer/modifier, marquer comme solved, etc.</p>
            </div>
           
              <div>
                <h2 className="text-xl font-bold mb-2">Gestion des Workshops</h2>
                <p className="text-gray-600">Accepter / Refuser les demandes de workshop, assigner sujet & rendez-vous.</p>
              </div>
            
          </>
        

        {/* Admin management links */}
       
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/category-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">Category Management</Link>
            <Link to="/post-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">Post Management</Link>
            <Link to="/knowledge-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">Knowledge Management</Link>
            <Link to="/user-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">User Management</Link>
            <Link to="/request-role-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">Role Requests</Link>
            <Link to="/reclamation-management" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl text-center block">Reclamations</Link>
          </div>
        
      </div>

   
    </div>
  );
};

export default Dashboard;
