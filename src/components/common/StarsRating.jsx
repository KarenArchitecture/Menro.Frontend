import React from "react";
import "../../assets/css/stars-rating.css";

function StarsRating({
  value,
  initial = 0,
  interactive = false,
  onChange,
  size,
  className = "",
  activeIcon = "/images/comments/star-active-icon.svg",
  inactiveIcon = "/images/comments/star-inactive-icon.svg",
}) {
  const current = interactive ? (value ?? 0) : initial;
  const [hover, setHover] = React.useState(0);

  return (
    <div
      className={`star-rating ${interactive ? "interactive" : ""} ${
        size === "lg" ? "star-rating--lg" : ""
      } ${className}`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hover || current);
        return (
          <img
            key={star}
            src={isActive ? activeIcon : inactiveIcon}
            alt="star"
            className={`star-icon ${isActive ? "active" : "inactive"}`}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(star)}
          />
        );
      })}
    </div>
  );
}

export default StarsRating;