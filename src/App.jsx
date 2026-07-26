// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";

import AdminMusicPage from "./pages/AdminMusicPage";
import AdminPage from "./pages/AdminPage";
import BillsPage from "./pages/BillsPage";
import BlogPage from "./pages/BlogPage";
import BlogResultPage from "./pages/BlogResultPage";
import ChangePasswordPage from "./pages/Authentication/ChangePasswordPage";
import ChangePhone from "./pages/Authentication/ChangePhone";
import CheckoutPage from "./pages/CheckoutPage";
import CommentsPage from "./pages/CommentsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Authentication/LoginPage";
import MusicPage from "./pages/MusicPage";
import NotFoundPage from "./pages/NotFoundPage";
import Orders from "./pages/OrdersPage";
import PopularFoodsBrowsePage from "./pages/PopularFoodsBrowsePage";
import ProfilePage from "./pages/Authentication/ProfilePage";
import RecentOrdersBrowsePage from "./pages/RecentOrdersBrowsePage";
import RegisterPage from "./pages/Authentication/RegisterPage";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import RestaurantPage from "./pages/RestaurantPage";
import RestaurantsBrowsePage from "./pages/RestaurantsBrowsePage";
import UnauthorizedPage from "./pages/Authentication/UnauthorizedPage";
import UserProfileForm from "./components/common/UserProfileForm";

import MobileNav from "./components/common/MobileNav";
import ProtectedRoute from "./components/common/ProtectedRoute";
import {
  DrawerStateProvider,
  useDrawerState,
} from "../src/Context/DrawerStateContext";
import { CartProvider } from "./components/shop/CartContext";
import RestaurantSwitchConfirmModal from "./components/shop/RestaurantSwitchConfirmModal";

// --- Page wrapper for 3D depth animation ---
// (defined ONCE, at module scope, outside App)
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

// --- Single App component ---
export default function App() {
  const { pathname } = useLocation();

  const NAV_HIDE_PREFIXES = [
    "/admin",
    "/checkout",
    "/landing",
    "/restaurant",
    "/orders/bill",
    "/music",
    "/favorites",
    "/blog",
  ];

  const NO_PADDING_PREFIXES = ["/landing", "/blog", "/orders/bill"];

  const hideMobileNav = NAV_HIDE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const removePadding = NO_PADDING_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  return (
    <DrawerStateProvider>
      <CartProvider>
        <PageWrapper hideMobileNav={hideMobileNav} removePadding={removePadding}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin", "owner"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/music"
              element={
                <ProtectedRoute roles={["admin", "owner"]}>
                  <AdminMusicPage />
                </ProtectedRoute>
              }
            />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blogresult" element={<BlogResultPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/change-phone" element={<ChangePhone />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/foods/:foodId/comments" element={<CommentsPage />} />
            <Route path="/foods/popular" element={<PopularFoodsBrowsePage />} />
            <Route
              path="/foods/popular/:categoryId"
              element={<PopularFoodsBrowsePage />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/bill/:id" element={<BillsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["customer", "admin", "owner"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute roles={["customer", "admin", "owner"]}>
                  <UserProfileForm />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/register-restaurant"
              element={<RegisterRestaurantPage />}
            />
            <Route path="/restaurant/:slug" element={<RestaurantPage />} />
            <Route path="/restaurant/:slug/music" element={<MusicPage />} />
            <Route path="/restaurants" element={<RestaurantsBrowsePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageWrapper>
        <RestaurantSwitchConfirmModal />
      </CartProvider>
    </DrawerStateProvider>
  );
}