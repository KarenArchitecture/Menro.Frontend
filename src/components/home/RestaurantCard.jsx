// // src/components/home/RestaurantCard.jsx
// import React from "react";
// import StarIcon from "../icons/StarIcon";
// import { Link } from "react-router-dom";

// function RestaurantCard({ restaurant }) {
//   if (!restaurant) return null;

//   const {
//     imageUrl = "/images/res-card-1.png", // default fallback
//     discount = 0,
//     hours = "نامشخص",
//     logoUrl = "/images/logo-green.png",
//     name = "رستوران",
//     rating = "N/A",
//     ratingCount = 0,
//     type = "نوع نامشخص",
//     isOpen = false, 
//   } = restaurant;

//   const restaurantSlug = restaurant.slug; // make sure `slug` exists on restaurant
//   const restaurantId = restaurant.id;

//   const restaurantHref =
//     restaurantSlug
//       ? `/restaurant/${encodeURIComponent(restaurantSlug)}`
//       : restaurantId != null
//       ? `/restaurant/${restaurantId}`
//       : undefined;

//   return (
//     <div className="card">
//       <div className="card-img-container">
//         <img
//           src={imageUrl}
//           alt={`عکس رستوران ${name}`}
//           className="card-img"
//           onError={(e) => {
//           e.currentTarget.onerror = null;
//           e.currentTarget.src = "/images/res-card-1.png";
//         }}
//         />

//         {discount > 0 && (
//           <div className="discount-bubble">
//             تا <span className="discount_num">{discount}%</span> درصد تخفیف
//           </div>
//         )}

//         <div className="logo-container">
//           <img
//             src={logoUrl}
//             alt={`لوگو رستوران ${name}`}
//             className="restaurant-badge"
//             onError={(e) => {
//               e.currentTarget.onerror = null;
//               e.currentTarget.src = "/images/logo-green.png";
//             }}
//           />
//         </div>
//       </div>

//       <div className="card-body">
//         <span className="time-badge">
//           <span className="time-badge__time">{hours}</span>
//           <span className={`time-badge__status ${isOpen ? "open" : "closed"}`}>
//             {isOpen ? "باز است" : "بسته است"}
//           </span>
//         </span>

//         <div className="restaurant-header">
//           <h3 className="restaurant-name">{name}</h3>
//         </div>

//         <div className="restaurant-description">
//           <p>{type}</p>
//           <div className="rating">
//             <StarIcon />
//             <span className="rate">
//               {typeof rating === "number" ? rating.toFixed(1) : rating}
//             </span>
//             <span className="rate-voters-num">({ratingCount})</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RestaurantCard;


// src/components/home/RestaurantCard.jsx
import React from "react";
import StarIcon from "../icons/StarIcon";
import { Link } from "react-router-dom";

function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const {
    imageUrl = "/images/res-card-1.png",
    discount = 0,
    hours = "نامشخص",
    logoUrl = "/images/logo-green.png",
    name = "رستوران",
    rating = "N/A",
    ratingCount = 0,
    type = "نوع نامشخص",
    isOpen = false,
    slug,
  } = restaurant;

  // If slug is missing, fallback div
  if (!slug) {
    console.warn("Restaurant slug is missing:", restaurant);
    return (
      <div className="card">
        {/* card content without link */}
        <div className="card-img-container">
          <img src={imageUrl} alt={`عکس رستوران ${name}`} className="card-img" />
          {discount > 0 && (
            <div className="discount-bubble">
              تا <span className="discount_num">{discount}%</span> درصد تخفیف
            </div>
          )}
          <div className="logo-container">
            <img src={logoUrl} alt={`لوگو رستوران ${name}`} className="restaurant-badge" />
          </div>
        </div>
        <div className="card-body">
          <span className="time-badge">
            <span className="time-badge__time">{hours}</span>
            <span className={`time-badge__status ${isOpen ? "open" : "closed"}`}>
              {isOpen ? "باز است" : "بسته است"}
            </span>
          </span>
          <div className="restaurant-header">
            <h3 className="restaurant-name">{name}</h3>
          </div>
          <div className="restaurant-description">
            <p>{type}</p>
            <div className="rating">
              <StarIcon />
              <span className="rate">{typeof rating === "number" ? rating.toFixed(1) : rating}</span>
              <span className="rate-voters-num">({ratingCount})</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal clickable card with slug
  return (
    <Link
      to={`/restaurant/${encodeURIComponent(slug)}`}
      className="card card-link"
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      <div className="card-img-container">
        <img
          src={imageUrl}
          alt={`عکس رستوران ${name}`}
          className="card-img"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/res-card-1.png"; }}
        />
        {discount > 0 && (
          <div className="discount-bubble">
            تا <span className="discount_num">{discount}%</span> درصد تخفیف
          </div>
        )}
        <div className="logo-container">
          <img
            src={logoUrl}
            alt={`لوگو رستوران ${name}`}
            className="restaurant-badge"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/logo-green.png"; }}
          />
        </div>
      </div>
      <div className="card-body">
        <span className="time-badge">
          <span className="time-badge__time">{hours}</span>
          <span className={`time-badge__status ${isOpen ? "open" : "closed"}`}>
            {isOpen ? "باز است" : "بسته است"}
          </span>
        </span>
        <div className="restaurant-header">
          <h3 className="restaurant-name">{name}</h3>
        </div>
        <div className="restaurant-description">
          <p>{type}</p>
          <div className="rating">
            <StarIcon />
            <span className="rate">{typeof rating === "number" ? rating.toFixed(1) : rating}</span>
            <span className="rate-voters-num">({ratingCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;
