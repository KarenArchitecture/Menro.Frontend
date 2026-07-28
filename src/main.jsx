// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { GlobalUIProvider } from "./components/common/GlobalUI/GlobalUIProvider";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/generic.css";
import "./assets/css/styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <GlobalUIProvider>
          <App />
        </GlobalUIProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
