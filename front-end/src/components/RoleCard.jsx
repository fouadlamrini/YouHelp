import React from "react";

const RoleCard = ({ role, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <h3 className="text-xl font-bold mb-2">{role}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default RoleCard;
