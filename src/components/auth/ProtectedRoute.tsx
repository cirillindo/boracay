// src/components/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchUserAndRole = async () => {
      console.log('ProtectedRoute: fetchUserAndRole started for path:', location.pathname);
      setLoading(true); // Start loading
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (isMounted) {
          setUser(authUser);
        }

        if (authUser) {
          console.log('ProtectedRoute: User authenticated. User ID:', authUser.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileError) {
            console.error('ProtectedRoute: Error fetching user profile:', profileError);
            if (isMounted) {
              setUserRole(null);
            }
          } else if (profileData) {
            console.log('ProtectedRoute: User role fetched:', profileData.role);
            if (isMounted) {
              setUserRole(profileData.role);
            }
          } else {
            console.log('ProtectedRoute: No profile data found for user.');
            if (isMounted) {
              setUserRole(null);
            }
          }
        } else {
          console.log('ProtectedRoute: User not authenticated.');
          if (isMounted) {
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('ProtectedRoute: Error in fetchUserAndRole:', error);
        if (isMounted) {
          setUser(null);
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('ProtectedRoute: fetchUserAndRole finished. Loading state:', false);
        }
      }
    };

    // Initial fetch
    fetchUserAndRole();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('ProtectedRoute: Auth state changed. Event:', _event);
      // When auth state changes, re-fetch user and role to ensure consistency
      // This will trigger fetchUserAndRole, which will update user and userRole states
      fetchUserAndRole(); 
    });

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Only run once on mount, auth state changes are handled by subscription

  if (loading) {
    console.log('ProtectedRoute: Rendering loading state.');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to admin login
  if (!user) {
    console.log('ProtectedRoute: User not found, redirecting to /admin/login.');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Wait for role to be loaded before making access decisions
  // If userRole is null, it means we're still fetching the role or there was an error
  if (userRole === null) {
    console.log('ProtectedRoute: User authenticated but role is null, rendering loading state. 2');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Check if the user has the 'admin' role for the /admin route
  if (location.pathname.startsWith('/admin') && userRole !== 'admin') {
    console.log('ProtectedRoute: Access denied for /admin path. User role:', userRole);
    return <Navigate to="/admin/login" replace />;
  }

  // Check if the user has the 'staff' role for the /staff route
  if (location.pathname.startsWith('/staff') && userRole !== 'staff' && userRole !== 'admin') {
    console.log('ProtectedRoute: Access denied for /staff path. User role:', userRole);
    return <Navigate to="/admin/login" replace />;
  }

  console.log('ProtectedRoute: Access granted. Rendering children.');
  return <>{children}</>;
};

export default ProtectedRoute;
