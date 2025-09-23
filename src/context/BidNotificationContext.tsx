// src/context/BidNotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface BidNotificationContextType {
  hasNewBids: boolean;
  setHasNewBids: (status: boolean) => void;
}

const BidNotificationContext = createContext<BidNotificationContextType | undefined>(undefined);

interface BidNotificationProviderProps {
  children: ReactNode;
}

export const BidNotificationProvider: React.FC<BidNotificationProviderProps> = ({ children }) => {
  const [hasNewBids, setHasNewBids] = useState(false);

  useEffect(() => {
    console.log('BidNotificationProvider: Setting up Supabase real-time subscription for bids...');
    // Temporarily comment out this block to debug reload issue
    /*
    const subscription = supabase
      .channel('bid_notifications') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids' },
        (payload) => {
          console.log('BidNotificationProvider: New bid INSERT event received!', payload);
          setHasNewBids(true);
        }
      )
      .subscribe();

    return () => {
      console.log('BidNotificationProvider: Cleaning up Supabase real-time subscription.');
      supabase.removeChannel(subscription);
    };
    */
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <BidNotificationContext.Provider value={{ hasNewBids, setHasNewBids }}>
      {children}
    </BidNotificationContext.Provider>
  );
};

export const useBidNotification = () => {
  const context = useContext(BidNotificationContext);
  if (context === undefined) {
    throw new Error('useBidNotification must be used within a BidNotificationProvider');
  }
  return context;
};
