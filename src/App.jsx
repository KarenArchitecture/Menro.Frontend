import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import MobileNav from "./components/common/MobileNav";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ChangePhone from "./pages/ChangePhone";

export default function App() {
  const { pathname } = useLocation();
  const NAV_HIDE_PREFIXES = ["/admin", "/checkout"];

  const hideMobileNav = NAV_HIDE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/restaurant/:slug" element={<RestaurantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/change-phone" element={<ChangePhone />} />
        <Route
          path="/register-restaurant"
          element={<RegisterRestaurantPage />}
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin", "owner"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!hideMobileNav && <MobileNav />}
    </>
  );
}
