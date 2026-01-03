export default function Posts() {
  const posts = [
    { id: 1, title: "React state issue", author: "Ahmed", status: "Open" },
    { id: 2, title: "Node.js API error", author: "Fatima", status: "Solved" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Author</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="px-4 py-2">{p.title}</td>
              <td className="px-4 py-2">{p.author}</td>
              <td className="px-4 py-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
