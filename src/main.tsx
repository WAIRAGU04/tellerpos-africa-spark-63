
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { SidebarProvider } from '@/components/ui/sidebar';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SidebarProvider>
      <AnalyticsProvider>
        <App />
      </AnalyticsProvider>
    </SidebarProvider>
  </React.StrictMode>
);
