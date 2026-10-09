import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

export default function BrowsePageLayout({ searchQuery, onSearchChange, children }) {
  const navigate = useNavigate();
  const hasQuery = Boolean(searchQuery.trim());

  return (
    <>
      <Header
        isSearchActive
        onSearchSubmit={onSearchChange}
        onBack={() => (hasQuery ? onSearchChange("") : navigate("/home"))}
      />
      <main className="content">{children}</main>
    </>
  );
}