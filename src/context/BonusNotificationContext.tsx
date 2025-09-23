// src/context/BonusNotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface BonusNotificationContextType {
  hasNewBonuses: boolean;
  setHasNewBonuses: (status: boolean) => void;
}

const BonusNotificationContext = createContext<BonusNotificationContextType | undefined>(undefined);

interface BonusNotificationProviderProps {
  children: ReactNode;
}

export const BonusNotificationProvider: React.FC<BonusNotificationProviderProps> = ({ children }) => {
  const [hasNewBonuses, setHasNewBonuses] = useState(false);

  useEffect(() => {
    console.log('BonusNotificationProvider: Setting up Supabase real-time subscription for staff_bonuses...');
    
    const subscription = supabase
      .channel('bonus_notifications') // Unique channel name for bonuses
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_bonuses' },
        (payload) => {
          console.log('BonusNotificationProvider: New bonus INSERT event received!', payload);
          setHasNewBonuses(true);
        }
      )
      .subscribe();

    return () => {
      console.log('BonusNotificationProvider: Cleaning up Supabase real-time subscription.');
      supabase.removeChannel(subscription);
    };
    
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <BonusNotificationContext.Provider value={{ hasNewBonuses, setHasNewBonuses }}>
      {children}
    </BonusNotificationContext.Provider>
  );
};

export const useBonusNotification = () => {
  const context = useContext(BonusNotificationContext);
  if (context === undefined) {
    throw new Error('useBonusNotification must be used within a BonusNotificationProvider');
  }
  return context;
};

