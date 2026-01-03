import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/admin/AdminPage";
import Users from "./pages/admin/Users";
import Categories from "./pages/admin/Categories";
import Subcategories from "./pages/admin/Subcategories";
import Knowledge from "./pages/admin/Knowledge";
import Posts from "./pages/admin/Posts";
import Favorites from "./pages/admin/Favorites";
import RequestRole from "./pages/admin/RequestRole";
import ConnectedPage from "./pages/ConnectedPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        >
          {/* Nested routes pour sidebar options */}
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories" element={<Subcategories />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="posts" element={<Posts />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="requestrole" element={<RequestRole />} />
        </Route>

        {/* Routes protégées connected */}
        <Route
          path="/connected"
          element={
            <ProtectedRoute role="connected">
              <ConnectedPage />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
