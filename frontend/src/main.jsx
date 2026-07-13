import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
// Auth Context
import { AuthProvider } from "./context/AuthContext.jsx";

// Web Vitals tracking — measure real Core Web Vitals metrics
// Dynamic import to avoid blocking startup
import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
  const reportVitals = (metric) => {
    // In production, send to analytics service
    if (window.__REPORT_VITALS) {
      window.__REPORT_VITALS(metric)
    }
  }
  
  onCLS(reportVitals)
  onFID(reportVitals)
  onFCP(reportVitals)
  onLCP(reportVitals)
  onTTFB(reportVitals)
}).catch(() => {
  // web-vitals not available, skip
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);