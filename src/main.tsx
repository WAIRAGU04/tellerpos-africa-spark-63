
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Remove AnalyticsProvider from main.tsx since it's already in App.tsx
// import { AnalyticsProvider } from './contexts/AnalyticsContext';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
