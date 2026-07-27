import React, { useState } from "react";
import StarsRating from "../common/StarsRating";
import "../../assets/css/comment-composer.css";

export default function CommentComposer({ onSubmit, isSubmitting }) {
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);

    const hasText = text.trim().length > 0;
    const hasRating = rating > 0;
    const isActive = hasText && hasRating;

    const handleSubmit = () => {
        if (!isActive || isSubmitting) return;
        onSubmit({ text: text.trim(), rating }, () => {
        setText("");
        setRating(0);
        });
    };

    let hint = null;
    if (!isActive) {
        if (hasText && !hasRating) hint = "یک قدم مونده — امتیازتو با ستاره‌ها انتخاب کن ⭐";
        else if (!hasText && hasRating) hint = "عالی! حالا چند خط هم درباره تجربه‌ت بنویس";
    }

    return (
        <div className="composer-box">
        <textarea
            className="composer-textarea"
            placeholder="نظر خود را بنویسید..."
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
        />
        <div className="composer-footer">
            <button
            type="button"
            className={`composer-submit ${isActive ? "active" : "disabled"}`}
            disabled={!isActive || isSubmitting}
            onClick={handleSubmit}
            >
            {isSubmitting ? "در حال ارسال..." : "ثبت نظر"}
            </button>
            <StarsRating
            interactive
            value={rating}
            onChange={setRating}
            className={hasText && !hasRating ? "composer-stars--attention" : ""}
            />
        </div>
        {hint && <div className="composer-hint">{hint}</div>}
        </div>
    );
}