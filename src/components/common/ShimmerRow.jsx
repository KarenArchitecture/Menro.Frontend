// src/components/common/ShimmerRow.jsx
import React from "react";
import "../../assets/css/state-message.css";

export default function ShimmerRow({
    height = 120,
    width = "92%",
    style,
    }) {
    return (
        <div
        className="shimmer-row"
        style={{
            width,
            height,
            margin: "0 auto",
            borderRadius: 12,
            ...style, // ✅ allow margin/padding/etc passed from caller
        }}
        />
    );
}