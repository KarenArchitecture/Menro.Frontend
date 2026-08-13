// src/components/common/PageHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BackIcon from "../icons/BackIcon";
import "../../assets/css/page-header.css";

/**
 * Generic page header used across all "مشاهده همه" / browse-style pages.
 * Mirrors CheckoutHeader's layout exactly: back button pinned right,
 * icon + title pinned left, RTL. Pass `icon` as a ready-to-render node
 * (e.g. an <img> or inline <svg>) — this component doesn't resolve URLs.
 */
export default function PageHeader({ icon, title, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <div className="page-header">
      <div className="page-header__title-group">
        {icon && <span className="page-header__icon">{icon}</span>}
        <h2 className="page-header__title">{title}</h2>
      </div>

      <button
        type="button"
        className="page-header__back-btn"
        onClick={handleBack}
        aria-label="بازگشت"
      >
        <BackIcon />
      </button>
    </div>
  );
}