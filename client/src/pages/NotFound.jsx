// 404 Not Found page with animation
import { Link } from 'react-router-dom';
import { FaHome, FaBriefcase } from 'react-icons/fa';

const NotFound = () => (
  <div className="container-fluid text-center py-5 px-4">
    <div className="py-5">
      <div className="animate-bounce-in">
        <h1
          className="fw-bold text-primary mb-0"
          style={{ fontSize: '8rem', lineHeight: 1 }}
        >
          404
        </h1>
        <div
          className="mx-auto my-3"
          style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '2px' }}
        />
        <h3 className="fw-bold mb-2">Page Not Found</h3>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </div>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/" className="btn btn-primary px-4">
          <FaHome className="me-2" /> Go Home
        </Link>
        <Link to="/jobs" className="btn btn-outline-primary px-4">
          <FaBriefcase className="me-2" /> Browse Jobs
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
