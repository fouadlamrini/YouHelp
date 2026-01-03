import { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Users", path: "/admin/users" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Subcategories", path: "/admin/subcategories" },
    { name: "Knowledge", path: "/admin/knowledge" },
    { name: "Posts", path: "/admin/posts" },
    { name: "Favorites", path: "/admin/favorites" },
    { name: "Request Role", path: "/admin/requestrole" },
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen p-4 transition-all duration-300 ${open ? "w-64" : "w-16"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="mb-6 text-white font-bold"
      >
        {open ? "Close" : "Open"}
      </button>

      <ul className="space-y-4">
        {menu.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className="block px-2 py-2 rounded hover:bg-gray-700"
            >
              {open ? item.name : item.name[0]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
