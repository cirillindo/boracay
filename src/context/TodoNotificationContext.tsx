// src/context/TodoNotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface TodoNotificationContextType {
  hasNewTodos: boolean;
  setHasNewTodos: (status: boolean) => void;
}

const TodoNotificationContext = createContext<TodoNotificationContextType | undefined>(undefined);

interface TodoNotificationProviderProps {
  children: ReactNode;
}

export const TodoNotificationProvider: React.FC<TodoNotificationProviderProps> = ({ children }) => {
  const [hasNewTodos, setHasNewTodos] = useState(false);

  useEffect(() => {
    console.log('TodoNotificationProvider: Setting up Supabase real-time subscription for todos...');
    
    const subscription = supabase
      .channel('todo_notifications') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_todo_items' },
        (payload) => {
          console.log('TodoNotificationProvider: New todo INSERT event received!', payload);
          setHasNewTodos(true);
        }
      )
      .subscribe();

    return () => {
      console.log('TodoNotificationProvider: Cleaning up Supabase real-time subscription.');
      supabase.removeChannel(subscription);
    };
    
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <TodoNotificationContext.Provider value={{ hasNewTodos, setHasNewTodos }}>
      {children}
    </TodoNotificationContext.Provider>
  );
};

export const useTodoNotification = () => {
  const context = useContext(TodoNotificationContext);
  if (context === undefined) {
    throw new Error('useTodoNotification must be used within a TodoNotificationProvider');
  }
  return context;
};

