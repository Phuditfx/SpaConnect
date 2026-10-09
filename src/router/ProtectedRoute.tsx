import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// This is a mock ProtectedRoute. In a real app, you would check Auth state from Context or Supabase here.
interface ProtectedRouteProps {
  allowedRoles?: ('shop' | 'therapist')[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  // allowedRoles, // Unused for now, but good for real implementation
  redirectPath = '/login' 
}) => {
  // Mock authentication - assume always logged in for now
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
