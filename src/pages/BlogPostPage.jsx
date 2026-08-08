import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import MobileHeader from "../components/common/MobileHeader";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";
import BlogPostHero from "../components/blogPost/BlogPostHero";
import BlogPostBody from "../components/blogPost/BlogPostBody";
import BlogPostAuthorTags from "../components/blogPost/BlogPostAuthorTags";
import RelatedPosts from "../components/blogPost/RelatedPosts";
import BlogPostSidebar from "../components/blogPost/BlogPostSidebar";
import { getBlogPostBootstrap } from "../api/blogs";
import { useGlobalUI } from "../components/common/GlobalUI/GlobalUIProvider";
import useDocumentTitle from "../hooks/useDocumentTitle";

import "../assets/css/BlogPostPage.css";

const leftIcons = [
  /* unchanged - same as BlogPage.jsx */
];

export default function BlogPostPage() {
  const { notify } = useGlobalUI();
  const { slug } = useParams();
  const navigate = useNavigate();
  useDocumentTitle("بلاگ");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const result = await getBlogPostBootstrap(slug);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            notify({
              type: "error",
              message: "پستی با این آدرس پیدا نشد",
            });
            setNotFound(true);
          } else console.error("Failed to load blog post", err);
          notify({
            type: "error",
            message: "خطا در بارگذاری پست بلاگ",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (data?.post?.title) document.title = data.post.title;
  }, [data]);

  if (notFound) {
    return (
      <div className="blog-page-wrapper bp-notfound" dir="rtl">
        <MobileHeader />
        <div className="bp-notfound__content">
          <h1>پستی با این آدرس پیدا نشد</h1>
          <button className="bp-share-btn" onClick={() => navigate("/blog")}>
            بازگشت به بلاگ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page-wrapper bp-page" dir="rtl">
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

      {loading || !data ? (
        <div className="bp-loading">در حال بارگذاری...</div>
      ) : (
        <>
          <div className="bp-layout">
            <article className="bp-article">
              <BlogPostHero post={data.post} />
              <BlogPostBody content={data.post.content} />
              <BlogPostAuthorTags post={data.post} />
              <RelatedPosts posts={data.relatedPosts} />
            </article>

            <BlogPostSidebar
              tags={data.sidebarTags}
              popularPosts={data.popularPosts}
            />
          </div>
        </>
      )}

      <section className="footer-bg blog-footer">
        <FooterFruitsScene />
        <div className="footer-bg__content">
          <GlassFooter />
        </div>
      </section>
    </div>
  );
}
