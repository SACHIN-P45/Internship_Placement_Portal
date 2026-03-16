// PageLoader — premium full-screen loader with PlacementPortal logo
import { useEffect, useState } from 'react';

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress bar (simulated)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p; // stall near end until real load
        return p + Math.random() * 8;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pl2-overlay">
      {/* Animated background particles */}
      <div className="pl2-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`pl2-particle pl2-particle-${i + 1}`} />
        ))}
      </div>

      <div className="pl2-content">
        {/* Logo with orbital rings */}
        <div className="pl2-orbit-wrapper">
          {/* Orbital rings */}
          <div className="pl2-ring pl2-ring-1" />
          <div className="pl2-ring pl2-ring-2" />
          <div className="pl2-ring pl2-ring-3" />

          {/* Orbiting dots */}
          <div className="pl2-orbit-dot pl2-orbit-dot-1" />
          <div className="pl2-orbit-dot pl2-orbit-dot-2" />
          <div className="pl2-orbit-dot pl2-orbit-dot-3" />

          {/* Logo at center */}
          <div className="pl2-logo-container">
            <img src="/logo.png" alt="PlacementPortal" className="pl2-logo" />
            <div className="pl2-logo-glow" />
          </div>
        </div>

        {/* Brand name */}
        <div className="pl2-brand">
          <span className="pl2-brand-placement">Placement</span>
          <span className="pl2-brand-portal">Portal</span>
        </div>

        <p className="pl2-tagline">CONNECTING CAREERS</p>

        {/* Progress bar */}
        <div className="pl2-progress-track">
          <div
            className="pl2-progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div className="pl2-progress-shimmer" />
        </div>

        <p className="pl2-status">Verifying session{dots}</p>
      </div>
    </div>
  );
};

export default PageLoader;
