import React, { useState } from "react";
import "../../assets/css/search-bar-styles.css";

function SearchBar({
  placeholder = "جستجو رستوران، نوشیدنی، غذا ...",
  className = "",
  onSubmit,
  value,
  onChange,
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");

  const searchTerm = isControlled ? value : internalValue;

  const handleChange = (event) => {
    const newValue = event.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    onSubmit?.(searchTerm.trim());
  };

  return (
    <form className={`search-bar ${className}`} onSubmit={handleSearch}>
      <input
        id="restaurant-search"
        name="search"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        autoComplete="off"
      />
      <button className="icon-button" type="submit" aria-label="search">
        <img src="/images/rounded_magnifer.svg" alt="" />
      </button>
    </form>
  );
}

export default SearchBar;
