import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";

import Post from "./pages/Post";
import Knowledge from "./pages/Knowledge";
import Favorite from "./pages/Favorite";
import Solution from "./pages/Solution";

// Admin Pages
import CategoryManagement from "./pages/CategoryManagement";
import SubCategoryManagement from "./pages/SubCategoryManagement";
import PostManagement from "./pages/PostManagement";
import KnowledgeManagement from "./pages/KnowledgeManagement";
import UserManagement from "./pages/UserManagement";
import RequestRoleManagement from "./pages/RequestRoleManagement";
import ReclamationManagement from "./pages/ReclamationManagement";
import Stats from "./pages/Stats";

// Formateur Pages
import WorkshopRequests from "./pages/WorkshopRequests";
import WorkshopSchedule from "./pages/WorkshopSchedule";

// Dummy User State
// user.role can be: "admin", "formateur", "etudiant", "connected", null (not logged in)
const App = () => {
  const [user, setUser] = useState({ role: "admin" }); // change role to test

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />

        <div className="flex-grow">
          <Routes>

            {/* Public Pages */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />

            {/* Logged-in pages */}
            <Route path="/post" element={user ? <Post user={user} /> : <Navigate to="/login" />} />
            <Route path="/knowledge" element={user ? <Knowledge user={user} /> : <Navigate to="/login" />} />
            <Route path="/favorite" element={user ? <Favorite user={user} /> : <Navigate to="/login" />} />
            <Route path="/solution" element={user ? <Solution user={user} /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/category-management" element={user?.role === "admin" ? <CategoryManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/subcategory-management" element={user?.role === "admin" ? <SubCategoryManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/post-management" element={user?.role === "admin" ? <PostManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/knowledge-management" element={user?.role === "admin" ? <KnowledgeManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/user-management" element={user?.role === "admin" ? <UserManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/request-role-management" element={user?.role === "admin" ? <RequestRoleManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/reclamation-management" element={user?.role === "admin" ? <ReclamationManagement user={user} /> : <Navigate to="/" />} />
            <Route path="/stats" element={user?.role === "admin" ? <Stats user={user} /> : <Navigate to="/" />} />

            {/* Formateur Routes */}
            <Route path="/workshop-requests" element={user?.role === "formateur" ? <WorkshopRequests user={user} /> : <Navigate to="/" />} />
            <Route path="/workshop-schedule" element={user?.role === "formateur" ? <WorkshopSchedule user={user} /> : <Navigate to="/" />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
