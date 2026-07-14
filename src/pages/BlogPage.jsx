import React, { useEffect, useState } from "react";
import AppHeader from "../components/common/AppHeader";
import BlogHero from "../components/blog/BlogHero";
import BlogCategories from "../components/blog/BlogCategories";
import BlogFeed from "../components/blog/BlogFeed";
import BlogSidebar from "../components/blog/BlogSidebar";
import BlogMobileFeedModule from "../components/blog/BlogMobileFeedModule";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";
import MobileHeader from "../components/common/MobileHeader";
import { getBlogPageBootstrap } from "../api/blogs";

import "../assets/css/styles-blog.css";

const leftIcons = [
  /* unchanged */
];

const BlogPage = () => {
  const [bootstrap, setBootstrap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getBlogPageBootstrap();
        if (!cancelled) setBootstrap(data);
      } catch (err) {
        console.error("Failed to load blog page bootstrap", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      <BlogHero hero={bootstrap?.hero} />
      <BlogCategories
        categories={bootstrap?.categories ?? []}
        loading={loading}
      />

      <div className="blog-desktop-layout">
        <section className="blog-content-section">
          <div className="blog-content-wrapper">
            <BlogFeed />
            <BlogSidebar
              tags={bootstrap?.sidebarTags ?? []}
              loading={loading}
            />
          </div>
        </section>
      </div>

      <div className="blog-mobile-layout">
        <section className="blog-mobile-feed-section">
          <BlogMobileFeedModule rows={3} perRow={2} />
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
