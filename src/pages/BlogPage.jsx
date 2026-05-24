import React from "react";
import AppHeader from "../components/common/AppHeader";
import BlogHero from "../components/blog/BlogHero";
import BlogCategories from "../components/blog/BlogCategories";
import BlogFeed from "../components/blog/BlogFeed";
import BlogSidebar from "../components/blog/BlogSidebar";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/landing/FooterFruitsScene";

// CSS Imports
import "../assets/css/styles-blog.css";
const leftIcons = [
  {
    key: "profile",
    icon: (
      <img
        src="/images/app-header-profile.svg"
        alt="profile"
        className="icon"
      />
    ),
  },
  {
    key: "cart",
    icon: <img src="/images/app-header-bag.svg" alt="cart" className="icon" />,
    badge: 1,
  },
  {
    key: "search",
    icon: (
      <img src="/images/app-header-search.svg" alt="search" className="icon" />
    ),
  },
];

const BlogPage = () => {
  return (
    <div className="blog-page-wrapper" dir="rtl">
      <div className="header-wrapper">
        <AppHeader
          leftIcons={leftIcons}
          position="fixed"
          top={12}
          maxWidth={1140}
          className="landing-desktop-header"
        />
      </div>

      <BlogHero />
      <BlogCategories />

      {/* Two-Column Content Section */}
      <section className="blog-content-section">
        <div className="blog-content-wrapper">
          {/* Because dir="rtl", the first item will automatically be on the right */}
          <BlogFeed />
          <BlogSidebar />
        </div>
      </section>

      {/* Footer Section */}
      {/* We wrap it in a relative container so the absolute positioned fruits stay behind the footer */}
      <div
        className="footer-wrapper"
        style={{ position: "relative", marginTop: "100px" }}
      >
        <FooterFruitsScene />
        <GlassFooter />
      </div>
    </div>
  );
};

export default BlogPage;
