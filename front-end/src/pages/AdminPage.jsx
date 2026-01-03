import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome {user?.name}</p>
    </div>
  );
}
