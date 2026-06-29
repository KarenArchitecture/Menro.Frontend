import { useState } from "react";
import LikeIcon from "../icons/LikeIcon";
import { toggleFavoriteFood } from "../../api/favorites";

export default function FavoriteButton({ foodId, initialLiked = false }) {
    const [liked, setLiked] = useState(initialLiked);
    const [loading, setLoading] = useState(false);

    const handleClick = async (e) => {
        e.stopPropagation();

        if (loading) return;

        setLoading(true);
        try {
        await toggleFavoriteFood(foodId);
        setLiked((prev) => !prev);
        } finally {
        setLoading(false);
        }
    };

    return (
        <button
        type="button"
        className="icon-btn modal-top-action"
        onClick={handleClick}
        disabled={loading}
        aria-label="علاقه‌مندی"
        >
        <LikeIcon active={liked} />
        </button>
    );
}