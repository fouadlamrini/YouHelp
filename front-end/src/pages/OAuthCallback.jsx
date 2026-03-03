import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Check if we have already processed to prevent infinite loops
    if (hasProcessed.current) {
      console.log('OAuth Callback already processed, skipping.');
      return;
    }

    // Only process if we have URL params (prevent infinite loops)
    if (!location.search && !location.hash) {
      console.log('No URL params found, skipping');
      return;
    }
    
    const handleOAuthCallback = async () => {
      // Mark as processed to prevent re-execution
      hasProcessed.current = true;

      try {
        console.log('OAuth Callback - Location:', location);
        console.log('OAuth Callback - Search:', location.search);
        console.log('OAuth Callback - Hash:', location.hash);
        
        // Get token and user from URL params (try both search and hash)
        let urlParams;
        if (location.search) {
          urlParams = new URLSearchParams(location.search);
        } else if (location.hash) {
          urlParams = new URLSearchParams(location.hash.substring(1));
        }
        
        const token = urlParams?.get('token');
        const userStr = urlParams?.get('user');
        
        console.log('OAuth Callback - Token:', token);
        console.log('OAuth Callback - UserStr:', userStr);
        
        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          console.log('OAuth Callback - Parsed User:', user);
          
          // Store in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update context
          authContext.setUser(user);
          
          console.log('OAuth Callback - User role:', user.role);
          
          // Clear URL parameters to prevent re-processing
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Small delay to ensure state is updated
          setTimeout(() => {
            // Redirect based on role
            if (user.role === null) {
              console.log('OAuth Callback - Redirecting to /pending');
              navigate('/pending');
            } else {
              console.log('OAuth Callback - Redirecting to /posts');
              navigate('/posts');
            }
          }, 100);
        } else {
          console.log('OAuth Callback - No token or user found, redirecting to login');
          // Fallback - redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    // Only call handleOAuthCallback if there are search or hash parameters
    if (location.search || location.hash) {
      handleOAuthCallback();
    } else {
      console.log('No search or hash parameters, skipping OAuth callback processing.');
      // If no parameters, and not already on /pending, redirect to login
      if (location.pathname !== '/pending') {
        navigate('/login');
      }
    }
  }, []); // Remove dependencies to prevent re-runs

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Processing login...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
