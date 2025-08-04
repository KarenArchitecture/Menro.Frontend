import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import MobileNav from "./components/common/MobileNav";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:slug" element={<RestaurantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/register-restaurant"
          element={<RegisterRestaurantPage />}
        />
      </Routes>

      <MobileNav />
    </>
  );
}
