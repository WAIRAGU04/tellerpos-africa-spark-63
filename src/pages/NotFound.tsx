
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-tellerpos-dark">
      <div className="text-center p-6 bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-tellerpos mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-tellerpos text-white font-medium rounded-lg hover:bg-tellerpos/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
