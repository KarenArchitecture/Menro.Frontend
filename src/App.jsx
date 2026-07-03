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
import BlogPage from "./pages/BlogPage";
import Orders from "./pages/OrdersPage";
import BillsPage from "./pages/BillsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import CommentsPage from "./pages/CommentsPage";
import {
  DrawerStateProvider,
  useDrawerState,
} from "../src/Context/DrawerStateContext";

// --- Page wrapper for 3D depth animation ---
function PageWrapper({ children, hideMobileNav, removePadding }) {
  const { isDrawerOpen } = useDrawerState();

  return (
    <>
      <div className={`page-background ${isDrawerOpen ? "is-visible" : ""}`} />

      <div className={`app-shell ${isDrawerOpen ? "app-shell--shifted" : ""}`}>
        <div
          className="app-shell__content"
          style={{ paddingBottom: removePadding ? "0px" : undefined }}
        >
          {children}
        </div>

        {!hideMobileNav && <MobileNav />}
      </div>
    </>
  );
}

export default function App() {
  const { pathname } = useLocation();

  // 2. Added "/orders/bill" so the mobile nav hides on the receipt view
  const NAV_HIDE_PREFIXES = [
    "/admin",
    "/checkout",
    "/landing",
    "/restaurant",
    "/orders/bill",
    "/favorites",
  ];

  // 3. Added "/orders/bill" so the app shell doesn't add blank padding at the bottom
  const NO_PADDING_PREFIXES = ["/landing", "/blog", "/orders/bill"];

  const hideMobileNav = NAV_HIDE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const removePadding = NO_PADDING_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  return (
    <DrawerStateProvider>
      <PageWrapper hideMobileNav={hideMobileNav} removePadding={removePadding}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/restaurants" element={<RestaurantsBrowsePage />} />
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

          <Route path="/orders" element={<Orders />} />
          {/* 4. Added the dynamic route for the BillsPage */}
          <Route path="/orders/bill/:id" element={<BillsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/comments" element={<CommentsPage />} />
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
          <Route
            path="/profile"
            element={
              // <ProtectedRoute roles={["user", "admin", "owner"]}>
              <ProfilePage />
              // </ProtectedRoute>
            }
          />
        </Routes>
      </PageWrapper>
    </DrawerStateProvider>
  );
}
