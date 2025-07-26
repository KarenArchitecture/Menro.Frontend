import React, { useState } from "react";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="نام یا لینک موسیقی را وارد کنید..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button className="icon-button" type="submit">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.58333 17.4998C13.9556 17.4998 17.5 13.9554 17.5 9.58317C17.5 5.21092 13.9556 1.6665 9.58333 1.6665C5.21108 1.6665 1.66666 5.21092 1.66666 9.58317C1.66666 13.9554 5.21108 17.4998 9.58333 17.4998Z"
            fill="#52555A"
          />
          <path
            d="M17.75 18.3335C17.6 18.3335 17.45 18.2751 17.3417 18.1668L15.7917 16.6168C15.5667 16.3918 15.5667 16.0251 15.7917 15.7918C16.0167 15.5668 16.3833 15.5668 16.6167 15.7918L18.1667 17.3418C18.3917 17.5668 18.3917 17.9335 18.1667 18.1668C18.05 18.2751 17.9 18.3335 17.75 18.3335Z"
            fill="#52555A"
          />
        </svg>
      </button>
    </form>
  );
}

export default SearchBar;