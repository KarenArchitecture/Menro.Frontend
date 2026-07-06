import React, { useState } from "react";
import "../../assets/css/stars-rating.css";

function StarsRating({
  initial = 0,
  interactive = false,
  activeIcon = "/images/comments/star-active-icon.svg",
  inactiveIcon = "/images/comments/star-inactive-icon.svg",
}) {
  const [rating, setRating] = useState(initial);
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hover || rating);

        return (
          <img
            key={star}
            src={isActive ? activeIcon : inactiveIcon}
            alt="star"
            className={`star-icon ${isActive ? "active" : "inactive"}`}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && setRating(star)}
          />
        );
      })}
    </div>
  );
}

export default StarsRating;
