// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GlobalUIProvider } from "./components/common/GlobalUI/GlobalUIProvider";
import { registerTabPresence } from "./utils/tabPresence";
registerTabPresence();

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/generic.css";
import "./assets/css/styles.css";

<Toaster
  position="top-center"
  toastOptions={{ style: { fontFamily: "Vazirmatn" } }}
/>;
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <GlobalUIProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalUIProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
