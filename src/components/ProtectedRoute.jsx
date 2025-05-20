import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    // Redirect to login page with the return URL
    return <Navigate to={`/login?redirect=${location.pathname}`} state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;