// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ShoppingCartProvider } from './context/ShoppingCartContext'; // Import ShoppingCartProvider
import { BidNotificationProvider } from './context/BidNotificationContext';
import { TodoNotificationProvider } from './context/TodoNotificationContext'; // Import TodoNotificationProvider
import { CheckinNotificationProvider } from './context/CheckinNotificationContext'; // Import CheckinNotificationProvider
import { BonusNotificationProvider } from './context/BonusNotificationContext'; // Import BonusNotificationProvider
import { OrderNotificationProvider } from './context/OrderNotificationContext'; // NEW: Import OrderNotificationProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ShoppingCartProvider>
          <BidNotificationProvider>
            <TodoNotificationProvider>
              <CheckinNotificationProvider>
                <BonusNotificationProvider>
                  {/* NEW: Wrap BonusNotificationProvider with OrderNotificationProvider */}
                  <OrderNotificationProvider>
                    <App />
                  </OrderNotificationProvider>
                </BonusNotificationProvider>
              </CheckinNotificationProvider>
            </TodoNotificationProvider>
          </BidNotificationProvider>
        </ShoppingCartProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
