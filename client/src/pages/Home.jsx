// Home page — premium landing page with animated hero, features, stats & CTA
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaUserGraduate,
  FaBuilding,
  FaBriefcase,
  FaArrowRight,
  FaCheckCircle,
  FaRocket,
  FaShieldAlt,
  FaChartLine,
  FaHandshake,
  FaStar,
  FaSearch,
  FaFileUpload,
  FaPaperPlane,
  FaTrophy,
  FaPlay,
} from 'react-icons/fa';

/* ---------- Animated counter hook ---------- */
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(end / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
};

const Home = () => {
  const { user } = useAuth();

  const stat1 = useCountUp(500);
  const stat2 = useCountUp(50);
  const stat3 = useCountUp(200);
  const stat4 = useCountUp(150);

  const getDashboardLink = () => {
    if (!user) return '/register';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="home-page">
      {/* ========== HERO SECTION ========== */}
      <section className="home-hero">
        {/* Animated background shapes */}
        <div className="hero-shapes">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
          <div className="hero-shape shape-4" />
          <div className="hero-shape shape-5" />
        </div>

        {/* Grid overlay */}
        <div className="hero-grid-overlay" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-80">
            <div className="col-lg-6 hero-content">
              <div className="hero-badge">
                <FaRocket className="me-2" />
                <span>#1 Campus Placement Platform</span>
              </div>

              <h1 className="hero-title">
                Your Gateway to
                <span className="hero-title-highlight"> Dream Career</span>
                <span className="hero-title-highlight"> Opportunities</span>
              </h1>

              <p className="hero-subtitle">
                Connect with top recruiters, discover internships & placements
                that match your skills, and launch your professional journey
                with confidence.
              </p>

              <div className="d-flex gap-3 flex-wrap mb-4">
                {!user ? (
                  <>
                    <Link to="/register" className="btn btn-home-primary btn-lg">
                      Get Started Free
                      <FaArrowRight className="ms-2" />
                    </Link>
                    <Link to="/jobs" className="btn btn-home-outline btn-lg">
                      <FaSearch className="me-2" />
                      Browse Jobs
                    </Link>
                  </>
                ) : (
                  <Link to={getDashboardLink()} className="btn btn-home-primary btn-lg">
                    Go to Dashboard
                    <FaArrowRight className="ms-2" />
                  </Link>
                )}
              </div>

              <div className="hero-trust">
                <div className="hero-trust-avatars">
                  {['R', 'P', 'A', 'S'].map((letter, i) => (
                    <div
                      key={i}
                      className="hero-trust-avatar"
                      style={{
                        background: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i],
                        marginLeft: i > 0 ? -10 : 0,
                        zIndex: 4 - i,
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="hero-trust-text">
                  <strong>500+</strong> students already placed
                  <div className="d-flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={12} className="text-warning" />
                    ))}
                    <span className="ms-1 small opacity-75">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              <div className="hero-illustration">
                {/* Floating cards */}
                <div className="hero-float-card card-1">
                  <div className="hfc-icon bg-primary bg-opacity-25">
                    <FaBriefcase className="text-primary" />
                  </div>
                  <div>
                    <div className="hfc-label">New Openings</div>
                    <div className="hfc-value">200+ Jobs</div>
                  </div>
                </div>

                <div className="hero-float-card card-2">
                  <div className="hfc-icon bg-success bg-opacity-25">
                    <FaCheckCircle className="text-success" />
                  </div>
                  <div>
                    <div className="hfc-label">Placement Rate</div>
                    <div className="hfc-value">95%</div>
                  </div>
                </div>

                <div className="hero-float-card card-3">
                  <div className="hfc-icon bg-warning bg-opacity-25">
                    <FaHandshake className="text-warning" />
                  </div>
                  <div>
                    <div className="hfc-label">Partner Companies</div>
                    <div className="hfc-value">50+</div>
                  </div>
                </div>

                {/* Central animated illustration */}
                <div className="hero-center-orb">
                  {/* Animated icons orbiting */}
                  <div className="hero-orbit orbit-1">
                    <div className="hero-orbit-icon"><FaUserGraduate size={20} /></div>
                  </div>
                  <div className="hero-orbit orbit-2">
                    <div className="hero-orbit-icon"><FaBriefcase size={18} /></div>
                  </div>
                  <div className="hero-orbit orbit-3">
                    <div className="hero-orbit-icon"><FaRocket size={16} /></div>
                  </div>
                  <div className="hero-orbit orbit-4">
                    <div className="hero-orbit-icon"><FaStar size={14} /></div>
                  </div>
                  
                  {/* Core glowing sphere */}
                  <div className="hero-core">
                    <div className="hero-core-inner">
                      <FaHandshake size={36} />
                    </div>
                    <div className="hero-core-glow" />
                  </div>
                  
                  {/* Animated rings */}
                  <div className="hero-ring ring-1" />
                  <div className="hero-ring ring-2" />
                  <div className="hero-ring ring-3" />
                  
                  {/* Floating particles */}
                  <div className="hero-particle p1" />
                  <div className="hero-particle p2" />
                  <div className="hero-particle p3" />
                  <div className="hero-particle p4" />
                  <div className="hero-particle p5" />
                  <div className="hero-particle p6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 rounded-pill fw-medium">
              How It Works
            </span>
            <h2 className="fw-bold display-6">
              Three Simple Steps to Your <span className="text-primary">Dream Job</span>
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 560 }}>
              Our streamlined process makes it easy to go from registration to placement
            </p>
          </div>

          <div className="row g-4 position-relative">
            {/* Connecting line */}
            <div className="steps-connector d-none d-md-block" />

            {[
              {
                icon: FaFileUpload,
                color: '#3b82f6',
                step: '01',
                title: 'Create Profile',
                desc: 'Sign up, fill in your details, upload your resume, and showcase your skills to recruiters.',
              },
              {
                icon: FaSearch,
                color: '#10b981',
                step: '02',
                title: 'Discover Jobs',
                desc: 'Browse through verified internships and jobs from top companies. Filter by skills, location, and type.',
              },
              {
                icon: FaPaperPlane,
                color: '#f59e0b',
                step: '03',
                title: 'Apply & Get Placed',
                desc: 'Apply with one click, track your application status in real-time. Get shortlisted and land your dream role!',
              },
            ].map((item, idx) => (
              <div key={idx} className="col-md-4">
                <div className="step-card text-center">
                  <div className="step-number">{item.step}</div>
                  <div
                    className="step-icon-wrap mx-auto mb-3"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    <item.icon size={28} />
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 mb-3 rounded-pill fw-medium">
              Built For Everyone
            </span>
            <h2 className="fw-bold display-6">
              Powerful Tools for <span className="text-success">Every Role</span>
            </h2>
          </div>

          <div className="row g-4">
            {[
              {
                icon: FaUserGraduate,
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                title: 'For Students',
                features: [
                  'One-click job applications',
                  'Real-time status tracking',
                  'Resume upload & profile builder',
                  'Personalized job recommendations',
                ],
              },
              {
                icon: FaBuilding,
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981, #059669)',
                title: 'For Companies',
                features: [
                  'Post jobs & internships easily',
                  'Review & shortlist candidates',
                  'Manage hiring pipeline',
                  'Access verified student profiles',
                ],
              },
              {
                icon: FaShieldAlt,
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                title: 'For Admins',
                features: [
                  'Approve company registrations',
                  'Monitor platform analytics',
                  'User management & moderation',
                  'Placement statistics dashboard',
                ],
              },
            ].map((card, idx) => (
              <div key={idx} className="col-md-4">
                <div className="feature-card h-100">
                  <div className="feature-card-icon" style={{ background: card.gradient }}>
                    <card.icon size={24} color="#fff" />
                  </div>
                  <h5 className="fw-bold mb-3">{card.title}</h5>
                  <ul className="list-unstyled mb-0">
                    {card.features.map((f, i) => (
                      <li key={i} className="d-flex align-items-start gap-2 mb-2">
                        <FaCheckCircle
                          size={14}
                          style={{ color: card.color, marginTop: 3, flexShrink: 0 }}
                        />
                        <span className="text-muted small">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="home-stats-section">
        <div className="container py-5">
          <div className="row text-center g-4">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: '+', label: 'Students Registered', color: '#3b82f6' },
              { ref: stat2.ref, count: stat2.count, suffix: '+', label: 'Partner Companies', color: '#10b981' },
              { ref: stat3.ref, count: stat3.count, suffix: '+', label: 'Job Openings', color: '#f59e0b' },
              { ref: stat4.ref, count: stat4.count, suffix: '+', label: 'Placements Done', color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3" ref={s.ref}>
                <div className="home-stat-item">
                  <h2 className="fw-bold mb-1" style={{ color: s.color, fontSize: '2.5rem' }}>
                    {s.count}{s.suffix}
                  </h2>
                  <p className="mb-0 text-white-50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="home-cta-section">
        <div className="container text-center py-5">
          <h2 className="fw-bold text-white display-6 mb-3">
            Ready to Launch Your Career?
          </h2>
          <p className="text-white-50 mb-4 mx-auto" style={{ maxWidth: 500 }}>
            Join thousands of students and companies already using our platform
            to connect talent with opportunity.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-warning btn-lg px-5 fw-bold">
                  Create Free Account
                  <FaArrowRight className="ms-2" />
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to={getDashboardLink()} className="btn btn-warning btn-lg px-5 fw-bold">
                Go to Dashboard
                <FaArrowRight className="ms-2" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
