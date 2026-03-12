// PageLoader — full-screen auth-check loader shown while AuthContext validates the JWT
import { useEffect, useState } from 'react';

const PageLoader = () => {
  const [dots, setDots] = useState('');

  // Animate the "..." text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-loader-overlay">
      <div className="page-loader-content">
        {/* Orbital ring animation */}
        <div className="page-loader-orbit">
          <div className="page-loader-ring ring-outer" />
          <div className="page-loader-ring ring-middle" />
          <div className="page-loader-ring ring-inner" />
          <div className="page-loader-core" />
        </div>

        {/* Branding */}
        <div className="page-loader-brand">
          <span className="page-loader-title">PlacementPortal</span>
          <span className="page-loader-status">Verifying session{dots}</span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
