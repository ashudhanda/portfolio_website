import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound renders the 404 fallback page for unknown routes.
 * It logs the attempted pathname to the console so broken or
 * mistyped internal links can be spotted during debugging.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Theme tokens (not hardcoded gray/blue): the default theme is dark,
          so bg-gray-100 rendered this page light while the rest of the site
          is dark. */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        {/* Router Link keeps the return trip client-side so the app isn't reloaded */}
        <Link to="/" className="text-primary hover:text-primary/80 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
