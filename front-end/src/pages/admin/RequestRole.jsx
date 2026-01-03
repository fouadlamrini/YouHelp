export default function RequestRole() {
  const requests = [
    { id: 1, user: "Samir", currentRole: "Connected", requestedRole: "Etudiant" },
    { id: 2, user: "Fouad", currentRole: "Connected", requestedRole: "Formateur" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Role Change Requests</h2>
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Current Role</th>
            <th className="px-4 py-2">Requested Role</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="px-4 py-2">{r.user}</td>
              <td className="px-4 py-2">{r.currentRole}</td>
              <td className="px-4 py-2">{r.requestedRole}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
