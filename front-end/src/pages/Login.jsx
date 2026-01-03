import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data.data;

      login(user, token);

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "connected") navigate("/connected");
      else navigate("/"); // fallback
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700"
        >
          Login
        </button>

        <div className="flex gap-4">
          <button className="w-full border py-2 rounded-lg hover:bg-gray-100">
            Google
          </button>
          <button className="w-full border py-2 rounded-lg hover:bg-gray-100">
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
