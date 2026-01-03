import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ConnectedPage() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Connected Page</h1>
      <p>Welcome {user?.name}</p>
    </div>
  );
}
