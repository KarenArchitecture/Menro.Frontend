// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import RestaurantsBrowsePage from "./pages/RestaurantsBrowsePage";
import RecentOrdersBrowsePage from "./pages/RecentOrdersBrowsePage";
import PopularFoodsBrowsePage from "./pages/PopularFoodsBrowsePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import MobileNav from "./components/common/MobileNav";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ChangePhone from "./pages/ChangePhone";
import AdminPage from "./pages/AdminPage";
// Import the new Blog Page
import BlogPage from "./pages/BlogPage";

import {
  DrawerStateProvider,
  useDrawerState,
} from "../src/Context/DrawerStateContext";

// --- Page wrapper for 3D depth animation ---
function PageWrapper({ children, hideMobileNav }) {
  const { isDrawerOpen } = useDrawerState();

  return (
    <>
      <div className={`page-background ${isDrawerOpen ? "is-visible" : ""}`} />

      <div className={`app-shell ${isDrawerOpen ? "app-shell--shifted" : ""}`}>
        <div className="app-shell__content">{children}</div>

        {!hideMobileNav && <MobileNav />}
      </div>
    </>
  );
}
// -----------------------------------------

export default function App() {
  const { pathname } = useLocation();
  const NAV_HIDE_PREFIXES = ["/admin", "/checkout", "/landing", "/restaurant"];

  const hideMobileNav = pathname.startsWith("/admin")
  || pathname.startsWith("/checkout")
  || pathname.startsWith("/landing")
  || pathname.startsWith("/restaurant/");

  return (
    <DrawerStateProvider>
      {/* PageWrapper now ONLY contains the Routes */}
      <PageWrapper hideMobileNav={hideMobileNav}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />

          {/* New Blog Route */}
          <Route path="/blog" element={<BlogPage />} />

          <Route path="/restaurants" element={<RestaurantsBrowsePage />} />
          <Route path="/orders" element={<RecentOrdersBrowsePage />} />
          <Route path="/foods/popular" element={<PopularFoodsBrowsePage />} />
          <Route
            path="/foods/popular/:categoryId"
            element={<PopularFoodsBrowsePage />}
          />
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
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PageWrapper>
    </DrawerStateProvider>
  );
}
