import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container py-xl">
      <div className="not-found-container text-center">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="not-found-actions mt-lg">
          <Link to="/" className="btn btn-primary">
            <FaHome /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;