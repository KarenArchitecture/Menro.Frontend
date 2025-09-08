import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import MobileNav from "./components/common/MobileNav";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  const { pathname } = useLocation();
  const NAV_HIDE_PREFIXES = ["/admin", "/checkout"];

  const hideMobileNav = NAV_HIDE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:slug" element={<RestaurantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/register-restaurant"
          element={<RegisterRestaurantPage />}
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
      {!hideMobileNav && <MobileNav />}
    </>
  );
}
