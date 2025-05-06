import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';


const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }
  
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  
  return children;
};

export default PrivateRoute;