// src/components/blogAdmin/RestaurantCardNode.jsx
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { getBlogRestaurantById } from "../../api/adminBlogs";
import "../../assets/css/admin/blogPostEditor_restaurantCardNode.css";

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

/**
 * NodeView (React component) that renders the actual card inside the
 * editor - both while editing and in read-only contexts. `node.attrs`
 * holds a snapshot of the restaurant's info at the time it was added (or
 * last refreshed) - it does not stay live-synced automatically.
 */
function RestaurantCardView({ node, updateAttributes, deleteNode }) {
  const {
    restaurantId,
    name,
    logoUrl,
    bannerUrl,
    categoryName,
    averageRating,
    votersCount,
  } = node.attrs;
  const [logoBroken, setLogoBroken] = useState(false);
  const [bannerBroken, setBannerBroken] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const showLogo = logoUrl && !logoBroken;
  const showBanner = bannerUrl && !bannerBroken;

  const handleRefresh = async () => {
    if (refreshing || !restaurantId) return;
    setRefreshing(true);
    setRefreshError("");
    try {
      const fresh = await getBlogRestaurantById(restaurantId);
      updateAttributes({
        name: fresh.name,
        logoUrl: fresh.logoImageUrl,
        bannerUrl: fresh.bannerImageUrl,
        slug: fresh.slug,
        categoryName: fresh.categoryName,
        averageRating: fresh.averageRating,
        votersCount: fresh.votersCount,
      });
      // Fresh URLs may point to different images than before - let both
      // thumbnails retry loading instead of staying stuck on "broken".
      setLogoBroken(false);
      setBannerBroken(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setRefreshError("این رستوران دیگر در دسترس نیست.");
      } else {
        setRefreshError(apiErrorMessage(err, "به‌روزرسانی با خطا مواجه شد."));
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <NodeViewWrapper className="bpe__restaurant-card" contentEditable={false}>
      <div className="bpe__restaurant-card-banner">
        <div className="bpe__restaurant-card-banner-img">
          {showBanner ? (
            <img
              src={bannerUrl}
              alt={name}
              onError={() => setBannerBroken(true)}
            />
          ) : (
            <div className="bpe__restaurant-card-banner-fallback">
              <i className="fas fa-utensils" />
            </div>
          )}
        </div>

        <span className="bpe__restaurant-card-label">رستوران معرفی‌شده</span>

        <div className="bpe__restaurant-card-actions">
          <button
            type="button"
            className="bpe__restaurant-card-action"
            title="به‌روزرسانی اطلاعات"
            disabled={refreshing}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRefresh}
          >
            <i className={`fas fa-rotate ${refreshing ? "fa-spin" : ""}`} />
          </button>
          <button
            type="button"
            className="bpe__restaurant-card-action bpe__restaurant-card-action--danger"
            title="حذف"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => deleteNode()}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <span className="bpe__restaurant-card-logo">
          {showLogo ? (
            <img src={logoUrl} alt={name} onError={() => setLogoBroken(true)} />
          ) : (
            <i className="fas fa-utensils" />
          )}
        </span>
      </div>

      <div className="bpe__restaurant-card-footer">
        {votersCount > 0 && (
          <span className="bpe__restaurant-card-rating">
            <i className="fas fa-star" /> {averageRating}{" "}
            <span className="bpe__restaurant-card-voters">({votersCount})</span>
          </span>
        )}
        <span className="bpe__restaurant-card-titles">
          <span className="bpe__restaurant-card-name">{name}</span>
          {categoryName && (
            <span className="bpe__restaurant-card-category">
              {categoryName}
            </span>
          )}
        </span>
      </div>

      {refreshError && (
        <div className="bpe__restaurant-card-refresh-error">{refreshError}</div>
      )}
    </NodeViewWrapper>
  );
}

/**
 * Atomic block node holding a snapshot of a restaurant's info at the time
 * it was added (or last refreshed). Attrs are persisted as data-*
 * attributes on a <div data-restaurant-card>, so saved HTML round-trips
 * correctly through setContent() on reload.
 */
const RestaurantCardNode = Node.create({
  name: "restaurantCard",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      restaurantId: { default: null },
      name: { default: "" },
      logoUrl: { default: null },
      bannerUrl: { default: null },
      slug: { default: "" },
      categoryName: { default: "" },
      averageRating: { default: 0 },
      votersCount: { default: 0 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-restaurant-card]",
        getAttrs: (el) => ({
          restaurantId: el.getAttribute("data-restaurant-id"),
          name: el.getAttribute("data-name"),
          logoUrl: el.getAttribute("data-logo-url"),
          bannerUrl: el.getAttribute("data-banner-url"),
          slug: el.getAttribute("data-slug"),
          categoryName: el.getAttribute("data-category-name"),
          averageRating: Number(el.getAttribute("data-average-rating")) || 0,
          votersCount: Number(el.getAttribute("data-voters-count")) || 0,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      restaurantId,
      name,
      logoUrl,
      bannerUrl,
      slug,
      categoryName,
      averageRating,
      votersCount,
    } = HTMLAttributes;
    return [
      "div",
      mergeAttributes({
        "data-restaurant-card": "",
        "data-restaurant-id": restaurantId,
        "data-name": name,
        "data-logo-url": logoUrl,
        "data-banner-url": bannerUrl,
        "data-slug": slug,
        "data-category-name": categoryName,
        "data-average-rating": averageRating,
        "data-voters-count": votersCount,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RestaurantCardView);
  },

  addCommands() {
    return {
      insertRestaurantCard:
        (restaurant) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              restaurantId: restaurant.id,
              name: restaurant.name,
              logoUrl: restaurant.logoImageUrl,
              bannerUrl: restaurant.bannerImageUrl,
              slug: restaurant.slug,
              categoryName: restaurant.categoryName,
              averageRating: restaurant.averageRating,
              votersCount: restaurant.votersCount,
            },
          }),
    };
  },
});

export default RestaurantCardNode;
