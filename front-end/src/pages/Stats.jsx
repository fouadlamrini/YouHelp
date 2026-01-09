import React from "react";

import StatCard from "../components/StatCard";

const dummyStats = [
  { title: "Total Posts", value: 12, icon: "📝" },
  { title: "Total Knowledge", value: 8, icon: "📚" },
  { title: "Reclamations", value: 2, icon: "⚠️" },
  { title: "Role Requests", value: 3, icon: "🙋" },
  { title: "Posts Solved", value: 7, icon: "✅" },
  { title: "Posts Non-solved", value: 5, icon: "❌" },
];

const Stats = () => {
 

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
   

      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dummyStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

    
    </div>
  );
};

export default Stats;
