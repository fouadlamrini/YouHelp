import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/posts/Home";
import About from "./pages/misc/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
// Importi l-page jdida
import PostPage from "./pages/posts/PostPage";
import CategoryManager from "./pages/admin/CategoryManager";
import KnowledgePage from "./pages/knowledge/KnowledgePage.jsx";
import MyPost from "./pages/posts/MyPosts.jsx";
import MyKnowledge from "./pages/knowledge/MyKnowledge.jsx";
import MyFavorites from "./pages/favorites/MyFavorites.jsx";
import MyShares from "./pages/posts/MyShares.jsx";
import InfoComplet from "./pages/auth/InfoComplet.jsx";
import WorkshopSchedule from "./pages/workshops/WorkshopSchedule.jsx";
import MyWorkshops from "./pages/workshops/MyWorkshops.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import CampusManager from "./pages/admin/CampusManager.jsx";
import LevelManager from "./pages/admin/LevelManager.jsx";
import ClassManager from "./pages/admin/ClassManager.jsx";
import FriendsList from "./pages/social/FriendsList.jsx";
import Info from "./pages/misc/Info.jsx";
import Settings from "./pages/misc/Settings.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- Public Routes (m3a Navbar l-9dima) --- */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <About />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Navbar />
                <Register />
              </>
            }
          />

          {/* --- Private/App Routes (Sidebar + NavbarLogged dakhliyan) --- */}
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <PostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge"
            element={
              <ProtectedRoute>
                <KnowledgePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-knowledge"
            element={
              <ProtectedRoute>
                <MyKnowledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-favourites"
            element={
              <ProtectedRoute>
                <MyFavorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shares"
            element={
              <ProtectedRoute>
                <MyShares />
              </ProtectedRoute>
            }
          />
          <Route path="/complete-profile" element={<InfoComplet />} />
          <Route
            path="/Shedule"
            element={
              <ProtectedRoute>
                <WorkshopSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-workshops"
            element={
              <ProtectedRoute>
                <MyWorkshops />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campus"
            element={
              <ProtectedRoute>
                <CampusManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/level"
            element={
              <ProtectedRoute>
                <LevelManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/class"
            element={
              <ProtectedRoute>
                <ClassManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/friends"
            element={
              <ProtectedRoute>
                <FriendsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/info"
            element={
              <ProtectedRoute>
                <Info />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
