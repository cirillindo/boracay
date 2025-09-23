// src/pages/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // NEW: Added 'client' as a possible loginType
  const [loginType, setLoginType] = useState<'admin' | 'staff' | 'client'>('admin'); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Fetch the user's profile to check their role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          await supabase.auth.signOut();
          setError('Error fetching user profile. Please try again.');
          return;
        }

        if (!profileData) {
          await supabase.auth.signOut();
          setError('No profile found for this user. Please contact an administrator.');
          return;
        }

        const actualRole = profileData.role;

        // NEW: Enforce login type based on actual role
        if (loginType === 'admin') {
          if (actualRole === 'admin') {
            navigate('/admin');
          } else {
            await supabase.auth.signOut();
            setError('You do not have admin access.');
          }
        } else if (loginType === 'staff') {
          // Allow staff and admin roles to access staff dashboard
          if (actualRole === 'staff' || actualRole === 'admin') {
            navigate('/staff');
          } else {
            await supabase.auth.signOut();
            setError('You do not have staff access.');
          }
        } else if (loginType === 'client') {
          if (actualRole === 'client') {
            navigate('/client/dashboard');
          } else {
            await supabase.auth.signOut();
            setError('You do not have client access.');
          }
        } else {
          // Fallback for unexpected loginType (should not happen with current buttons)
          await supabase.auth.signOut();
          setError('Invalid login type selected.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {/* Dynamically display title based on selected login type */}
              {loginType === 'admin' && 'Admin Login'}
              {loginType === 'staff' && 'Staff Login'}
              {loginType === 'client' && 'Client Login'} {/* NEW: Client Login Title */}
            </h2>
          </div>
          {/* NEW: Added Client Login button */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('staff')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'staff'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('client')} // NEW: Client Login Button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'client'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Client Login
            </button>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                disabled={loading}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-amber-500 group-hover:text-amber-400" />
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
};

export default AdminLogin;

