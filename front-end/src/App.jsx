import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Importi l-page jdida
import PostPage from "./pages/PostPage";
import CategoryManager from "./pages/CategoryManager";
import KnowledgePage from "./pages/KnowledgePage.jsx";
import MyPost from "./pages/MyPosts.jsx";
import MyKnowledge from "./pages/MyKnowledge.jsx";
import MyFavorites from "./pages/MyFavorites.jsx";
import MyShares from "./pages/MyShares.jsx";
import InfoComplet from "./pages/InfoComplet.jsx";
import Stats from "./pages/Stats.jsx";
import WorkshopSchedule from "./pages/WorkshopSchedule.jsx";
import MyWorkshops from "./pages/MyWorkshops.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import CampusManager from "./pages/CampusManager.jsx";
import LevelManager from "./pages/LevelManager.jsx";
import ClassManager from "./pages/ClassManager.jsx";
import FriendsList from "./pages/FriendsList.jsx";
import Info from "./pages/Info.jsx";
import Settings from "./pages/Settings.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
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
            path="/statistics"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
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
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
