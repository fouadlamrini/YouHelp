import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Register = ({ user }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "etudiant" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registration submitted! (UI only)");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar user={user} />

      <div className="flex justify-center items-center py-20 grow">
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg" />

          <select name="role" value={form.role} onChange={handleChange} className="w-full mb-6 px-4 py-2 border rounded-lg">
            <option value="etudiant">Etudiant</option>
            <option value="formateur">Formateur</option>
            <option value="connected">Connected</option>
          </select>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Register</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
