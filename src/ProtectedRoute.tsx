import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  console.log('AuthToken:', authToken); // Log de depuração

  if (!authToken) {
    console.log('No auth token found, redirecting to login'); // Log de depuração
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;