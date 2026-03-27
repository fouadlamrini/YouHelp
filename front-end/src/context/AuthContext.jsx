import { createContext, useState, useEffect, useContext } from "react";
import api, { usersApi } from "../services/api";

export const AuthContext = createContext();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function normalizeUser(data) {
  if (!data) return null;
  return {
    id: data._id ?? data.id,
    name: data.name,
    email: data.email,
    status: data.status,
    role: data.role?.name ?? data.role,
    profilePicture: data.profilePicture ?? null,
    completeProfile: data.completeProfile ?? false,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  // Hydrate user from API when we have a token (so profilePicture and name come from DB)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    usersApi
      .getMe()
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.data.user));

    setUser(res.data.data.user);
  };

  // REGISTER
  const register = async (data) => {
    return await api.post("/auth/register", data);
  };

  // LOGOUT — always clear local token/user even if API fails
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
