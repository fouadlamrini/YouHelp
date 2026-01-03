export default function Subcategories() {
  const subcategories = [
    { id: 1, name: "React", category: "Frontend" },
    { id: 2, name: "Node.js", category: "Backend" },
    { id: 3, name: "Figma", category: "UI/UX" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Subcategories</h2>
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((sub) => (
            <tr key={sub.id} className="border-b">
              <td className="px-4 py-2">{sub.id}</td>
              <td className="px-4 py-2">{sub.name}</td>
              <td className="px-4 py-2">{sub.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
