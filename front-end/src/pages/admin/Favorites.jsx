export default function Favorites() {
  const favorites = [
    { id: 1, title: "React Hooks Guide", user: "Ahmed" },
    { id: 2, title: "Node.js Auth", user: "Fatima" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Favorites</h2>
      <ul className="space-y-4">
        {favorites.map((f) => (
          <li key={f.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-gray-600">User: {f.user}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
