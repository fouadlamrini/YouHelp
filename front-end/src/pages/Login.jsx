import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Login = ({ user }) => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login submitted! (UI only)");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar user={user} />

      <div className="flex justify-center items-center py-20 grow">
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full mb-6 px-4 py-2 border rounded-lg" />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-4">Login</button>

          <div className="text-center">
            <button type="button" className="text-blue-600 hover:underline mr-2">Login with Google</button>
            <button type="button" className="text-blue-600 hover:underline">Login with GitHub</button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
