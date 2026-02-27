// Footer component

const Footer = () => (
  <footer className="bg-dark text-light py-4 mt-auto">
    <div className="container text-center">
      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
        <img src="/logo.png" alt="PlacementPortal" style={{ width: 100, height: 80 }} />
        <span className="fw-bold">PlacementPortal</span>
        <span className="text-secondary small">| Connecting Careers</span>
      </div>
      <p className="mb-0 small text-secondary">
        &copy; {new Date().getFullYear()} PlacementPortal. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
