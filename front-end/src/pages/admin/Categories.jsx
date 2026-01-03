export default function Categories() {
  const categories = [
    { id: 1, name: "Frontend" },
    { id: 2, name: "Backend" },
    { id: 3, name: "UI/UX" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b">
              <td className="px-4 py-2">{cat.id}</td>
              <td className="px-4 py-2">{cat.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
