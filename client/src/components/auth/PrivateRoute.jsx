import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// Component to protect routes that require authentication
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if route requires admin privileges
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  // Render the protected route
  return children;
};

export default PrivateRoute;