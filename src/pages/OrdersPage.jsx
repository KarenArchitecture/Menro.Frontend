// src/components/orders/Orders.jsx
import React from "react";
import "../assets/css/styles-orders.css";
import ContinueShopping from "../components/orders/ContinueShopping";
import PreviousOrderCard from "../components/orders/PreviousOrderCard";
const Orders = () => {
  return (
    <div style={{ minHeight: "100vh" }}>
      <ContinueShopping />
      <PreviousOrderCard />
    </div>
  );
};

export default Orders;
