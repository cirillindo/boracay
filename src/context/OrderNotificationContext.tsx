// src/context/OrderNotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface OrderNotificationContextType {
  hasNewOrders: boolean;
  setHasNewOrders: (status: boolean) => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

interface OrderNotificationProviderProps {
  children: ReactNode;
}

export const OrderNotificationProvider: React.FC<OrderNotificationProviderProps> = ({ children }) => {
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    console.log('OrderNotificationProvider: Setting up Supabase real-time subscription for orders...');
    
    const subscription = supabase
      .channel('order_notifications') // Unique channel name for orders
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('OrderNotificationProvider: New order INSERT event received!', payload);
          setHasNewOrders(true);
        }
      )
      .subscribe();

    return () => {
      console.log('OrderNotificationProvider: Cleaning up Supabase real-time subscription.');
      supabase.removeChannel(subscription);
    };
    
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <OrderNotificationContext.Provider value={{ hasNewOrders, setHasNewOrders }}>
      {children}
    </OrderNotificationContext.Provider>
  );
};

export const useOrderNotification = () => {
  const context = useContext(OrderNotificationContext);
  if (context === undefined) {
    throw new Error('useOrderNotification must be used within an OrderNotificationProvider');
  }
  return context;
};

