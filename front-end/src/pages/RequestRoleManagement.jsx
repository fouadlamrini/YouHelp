import React from "react";


const dummyRequests = [
  { User: "Ali", RequestedRole: "Formateur", Status: "Pending" },
  { User: "Sara", RequestedRole: "Etudiant", Status: "Accepted" },
];

const RequestRoleManagement = () => {
 

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Request Role Management</h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyRequests.map((req, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{req.User}</td>
                  <td className="px-6 py-4">{req.RequestedRole}</td>
                  <td className="px-6 py-4">{req.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
     
    </div>
  );
};

export default RequestRoleManagement;
