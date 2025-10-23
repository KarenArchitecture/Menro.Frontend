// src/components/common/ShimmerRow.jsx
import React from "react";
import "../../assets/css/state-message.css";

export default function ShimmerRow({ height = 120 }) {
    return (
        <div
        className="shimmer-row"
        style={{
            width: "92%",          // 90% width
            height,                // fixed height
            margin: "0 auto",      // center horizontally
            borderRadius: 12,
        }}
        />
    );
}
