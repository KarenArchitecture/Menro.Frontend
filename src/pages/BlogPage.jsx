import React from "react";
import AppHeader from "../components/common/AppHeader";
import BlogHero from "../components/blog/BlogHero";
import BlogCategories from "../components/blog/BlogCategories";
import BlogFeed from "../components/blog/BlogFeed";
import BlogSidebar from "../components/blog/BlogSidebar";
import BlogMobileBlocksModule from "../components/blog/BlogMobileBlocksModule";
import BlogMobileFeedModule from "../components/blog/BlogMobileFeedModule";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";
import MobileHeader from "../components/common/MobileHeader";

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

      <MobileHeader />
      <BlogHero />
      <BlogCategories />

      {/* Desktop layout */}
      <div className="blog-desktop-layout">
        <section className="blog-content-section">
          <div className="blog-content-wrapper">
            <BlogFeed />
            <BlogSidebar />
          </div>
        </section>
      </div>

      {/* Mobile layout */}
      {/* Mobile layout */}
      <div className="blog-mobile-layout">
        {/* 3 random blocks */}
        <section className="blog-mobile-blocks-section">
          {/* <BlogMobileBlocksModule mode="manual" forcedPairType="blogTags" />
          <BlogMobileBlocksModule mode="manual" forcedPairType="blogBanner" />
          <BlogMobileBlocksModule
            mode="manual"
            forcedPairType="blogTagsBanner"
          /> */}
          <BlogMobileBlocksModule mode="random" />
          <BlogMobileBlocksModule mode="random" />
          <BlogMobileBlocksModule mode="random" />
        </section>

        {/* Feed */}
        <section className="blog-mobile-feed-section">
          <BlogMobileFeedModule rows={3} perRow={2} />
        </section>

        {/* Final random block */}
        <section className="blog-mobile-blocks-section">
          <BlogMobileBlocksModule
            mode="manual"
            forcedPairType="bannerTags"
            showButton
          />
        </section>
      </div>

      <section className="footer-bg blog-footer">
        <FooterFruitsScene />
        <div className="footer-bg__content">
          <GlassFooter />
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
