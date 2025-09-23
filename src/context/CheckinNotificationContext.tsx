// src/context/CheckinNotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface CheckinNotificationContextType {
  hasNewCheckins: boolean;
  setHasNewCheckins: (status: boolean) => void;
}

const CheckinNotificationContext = createContext<CheckinNotificationContextType | undefined>(undefined);

interface CheckinNotificationProviderProps {
  children: ReactNode;
}

export const CheckinNotificationProvider: React.FC<CheckinNotificationProviderProps> = ({ children }) => {
  const [hasNewCheckins, setHasNewCheckins] = useState(false);

  useEffect(() => {
    console.log('CheckinNotificationProvider: Setting up Supabase real-time subscription for checkins...');
    
    const subscription = supabase
      .channel('checkin_notifications') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'checkins' },
        (payload) => {
          console.log('CheckinNotificationProvider: New checkin INSERT event received!', payload);
          setHasNewCheckins(true);
        }
      )
      .subscribe();

    return () => {
      console.log('CheckinNotificationProvider: Cleaning up Supabase real-time subscription.');
      supabase.removeChannel(subscription);
    };
    
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <CheckinNotificationContext.Provider value={{ hasNewCheckins, setHasNewCheckins }}>
      {children}
    </CheckinNotificationContext.Provider>
  );
};

export const useCheckinNotification = () => {
  const context = useContext(CheckinNotificationContext);
  if (context === undefined) {
    throw new Error('useCheckinNotification must be used within a CheckinNotificationProvider');
  }
  return context;
};

