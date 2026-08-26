import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem('nexora_token');
  const userJson = localStorage.getItem('nexora_user');
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {}

  if (!token || !user) {
    if (allowedRoles.includes('MERCHANT')) return <Navigate to="/login/merchant" replace />;
    if (allowedRoles.includes('AI_BUYER') || allowedRoles.includes('BUYER')) return <Navigate to="/login/buyer" replace />;
    if (allowedRoles.includes('ADMIN')) return <Navigate to="/login/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  // STRICT ROLE MATCHING & CROSS-ROLE REDIRECTION
  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(userRole) ||
      (userRole === 'BUYER' && allowedRoles.includes('AI_BUYER')) ||
      (userRole === 'AI_BUYER' && allowedRoles.includes('BUYER'));

    if (!isAllowed) {
      if (userRole === 'MERCHANT') {
        return <Navigate to="/merchant/overview" replace />;
      } else if (userRole === 'BUYER' || userRole === 'AI_BUYER') {
        return <Navigate to="/buyer/ai-shopping" replace />;
      } else if (userRole === 'ADMIN') {
        return <Navigate to="/admin/overview" replace />;
      }
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
