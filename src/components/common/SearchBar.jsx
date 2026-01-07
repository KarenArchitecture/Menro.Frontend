// import React, { useState } from "react";
// import "../../assets/css/search-bar-styles.css";
// function SearchBar({
//   placeholder = "جستجو رستوران، نوشیدنی، غذا ...",
//   className = "",
// }) {
//   const [searchTerm, setSearchTerm] = useState("");

//   const handleSearch = (event) => {
//     event.preventDefault();
//     console.log("Searching for:", searchTerm);
//   };

//   return (
//     <form className={`search-bar ${className}`} onSubmit={handleSearch}>
//       <input
//         type="text"
//         placeholder={placeholder}
//         value={searchTerm}
//         onChange={(event) => setSearchTerm(event.target.value)}
//       />
//       <button className="icon-button" type="submit" aria-label="search">
//         <img src="/images/rounded_magnifer.svg" alt="" />
//       </button>
//     </form>
//   );
// }

// export default SearchBar;

// src/components/common/SearchBar.jsx
import React, { useState } from "react";
import "../../assets/css/search-bar-styles.css";

function SearchBar({
  placeholder = "جستجو رستوران، نوشیدنی، غذا ...",
  className = "",
  onSubmit,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    onSubmit?.(searchTerm.trim()); // empty => exits search mode
  };

  return (
    <form className={`search-bar ${className}`} onSubmit={handleSearch}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button className="icon-button" type="submit" aria-label="search">
        <img src="/images/rounded_magnifer.svg" alt="" />
      </button>
    </form>
  );
}

export default SearchBar;
