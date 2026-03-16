// LoadingSpinner — upgraded with logo for page variant
// Props:
//   variant  : 'inline' (default) | 'page' — page centers in full viewport
//   message  : optional text shown beneath the spinner
//   size     : 'sm' | 'md' (default) | 'lg'

const LoadingSpinner = ({ variant = 'inline', message, size = 'md' }) => {
  if (variant === 'page') {
    return (
      <div className="lp-spinner-page">
        <div className="lp-page-loader-mini">
          {/* Mini orbital rings around logo */}
          <div className="lp-mini-ring lp-mini-ring-a" />
          <div className="lp-mini-ring lp-mini-ring-b" />
          <div className="lp-mini-logo-wrap">
            <img src="/logo.png" alt="Loading" className="lp-mini-logo" />
          </div>
        </div>
        {message && <p className="lp-spinner-message">{message}</p>}
      </div>
    );
  }

  // Inline: compact dual-ring spinner (no logo for small sizes)
  const spinner = (
    <div className={`lp-spinner lp-spinner-${size}`}>
      <div className="lp-spinner-ring lp-ring-a" />
      <div className="lp-spinner-ring lp-ring-b" />
      <div className="lp-spinner-dot" />
    </div>
  );

  return (
    <div className="lp-spinner-inline">
      {spinner}
      {message && <p className="lp-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
