export default function SolvedPosts() {
  const solvedPosts = [
    {
      id: 1,
      title: "React useEffect issue",
      author: "Ahmed",
      category: "Frontend",
      subcategory: "React",
      solvedBy: "Formateur Samir",
      dateSolved: "2026-01-01",
    },
    {
      id: 2,
      title: "Node.js API error",
      author: "Fatima",
      category: "Backend",
      subcategory: "Node.js",
      solvedBy: "Formateur Fouad",
      dateSolved: "2026-01-02",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Solved Posts</h2>
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Author</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Subcategory</th>
            <th className="px-4 py-2">Solved By</th>
            <th className="px-4 py-2">Date Solved</th>
          </tr>
        </thead>
        <tbody>
          {solvedPosts.map((post) => (
            <tr key={post.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-2">{post.title}</td>
              <td className="px-4 py-2">{post.author}</td>
              <td className="px-4 py-2">{post.category}</td>
              <td className="px-4 py-2">{post.subcategory}</td>
              <td className="px-4 py-2">{post.solvedBy}</td>
              <td className="px-4 py-2">{post.dateSolved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
