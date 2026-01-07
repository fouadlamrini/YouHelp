import React from "react";

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-4 hover:shadow-xl transition duration-300">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="text-gray-500">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
