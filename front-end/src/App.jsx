import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";

// Pages
import Home from "./pages/Home";
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
// Importi l-page jdida
import PostPage from './pages/PostPage'; 
import CategoryManager from "./pages/CategoryManager";
import KnowledgePage from "./pages/KnowledgePage.jsx";
import RoleRequestsPage from "./pages/RoleRequestsPage.jsx";
import MyPost from "./pages/MyPosts.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MyKnowledge from "./pages/MyKnowledge.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes (m3a Navbar l-9dima) --- */}
        <Route 
          path="/" 
          element={<><Navbar /><Home /></>} 
        />
        <Route 
          path="/about" 
          element={<><Navbar /><About /></>} 
        />
        <Route 
          path="/login" 
          element={<><Navbar /><Login /></>} 
        />
        <Route 
          path="/register" 
          element={<><Navbar /><Register /></>} 
        />

        {/* --- Private/App Routes (Sidebar + NavbarLogged dakhliyan) --- */}
        <Route path="/posts" element={<PostPage />} />
        <Route path="/categories" element={<CategoryManager />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/role-request" element={<RoleRequestsPage />} />
        <Route path="/my-posts" element={<MyPost />} />
        <Route path="/my-knowledge" element={<MyKnowledge />} />
        <Route path="/profile" element={<MyPost/>} />
        
        
        
      </Routes>
    </Router>
  );
};

export default App;