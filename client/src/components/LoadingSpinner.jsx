// LoadingSpinner — upgraded premium animated spinner
// Props:
//   variant  : 'inline' (default) | 'page' — page centers in full viewport
//   message  : optional text shown beneath the spinner
//   size     : 'sm' | 'md' (default) | 'lg'

const LoadingSpinner = ({ variant = 'inline', message, size = 'md' }) => {
  const spinner = (
    <div className={`lp-spinner lp-spinner-${size}`}>
      <div className="lp-spinner-ring lp-ring-a" />
      <div className="lp-spinner-ring lp-ring-b" />
      <div className="lp-spinner-dot" />
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="lp-spinner-page">
        {spinner}
        {message && <p className="lp-spinner-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className="lp-spinner-inline">
      {spinner}
      {message && <p className="lp-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
