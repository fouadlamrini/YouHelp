export default function Knowledge() {
  const knowledge = [
    { id: 1, title: "React Hooks", author: "Ahmed" },
    { id: 2, title: "Node.js Express", author: "Fatima" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Knowledge</h2>
      <ul className="space-y-4">
        {knowledge.map((k) => (
          <li key={k.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold text-lg">{k.title}</h3>
            <p className="text-gray-600">Author: {k.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
