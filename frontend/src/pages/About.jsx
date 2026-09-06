import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import './About.css';

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+',    label: 'Vehicles Available' },
  { value: '50+',     label: 'Cities Covered' },
  { value: '4.9★',   label: 'Average Rating' },
];

const VALUES = [
  { icon: '🤝', title: 'Trust',        desc: 'Every vehicle is verified, insured, and regularly serviced so you always get a safe, reliable ride.' },
  { icon: '💡', title: 'Transparency', desc: 'No hidden fees. The price you see is the price you pay — always.' },
  { icon: '⚡', title: 'Speed',        desc: 'Book in under two minutes. Our streamlined flow gets you on the road without the paperwork.' },
  { icon: '🌿', title: 'Sustainability', desc: 'We actively expand our EV and hybrid fleet to reduce our carbon footprint every year.' },
];

const TEAM = [
  { name: 'Arjun Mehta',   role: 'CEO & Co-Founder',     initial: 'A', color: '#111' },
  { name: 'Priya Sharma',  role: 'CTO & Co-Founder',     initial: 'P', color: '#4F46E5' },
  { name: 'Ravi Patel',    role: 'Head of Operations',   initial: 'R', color: '#0891B2' },
  { name: 'Sneha Kapoor',  role: 'Head of Customer Experience', initial: 'S', color: '#059669' },
];

function About() {
  return (
    <div className="about-page">
      <Hero title="About RentalHub" subtitle="Your trusted vehicle rental partner since 2018" />

      {/* ── Mission ──────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="container">
          <div className="about-mission">
            <div className="about-mission-text">
              <h2>We exist to make renting effortless</h2>
              <p>
                RentalHub was born out of frustration with complicated rental processes, surprise fees, and poor vehicle conditions.
                We built a platform where every step — browsing, booking, picking up, and returning — just works.
              </p>
              <p>
                Today we operate across 50+ cities in India, with a fleet of 500+ vehicles ranging from fuel-efficient hatchbacks to premium luxury sedans and SUVs.
              </p>
              <Link to="/fleet" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
                Browse Our Fleet →
              </Link>
            </div>
            <div className="about-mission-image">
              <div className="about-image-placeholder">🚗</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="about-stat-card">
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="about-section about-section--light">
        <div className="container">
          <h2 className="about-section-heading">What we stand for</h2>
          <div className="about-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="container">
          <h2 className="about-section-heading">Meet the team</h2>
          <div className="about-team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-avatar" style={{ background: m.color }}>
                  {m.initial}
                </div>
                <div className="about-team-name">{m.name}</div>
                <div className="about-team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta">
            <h2>Ready to hit the road?</h2>
            <p>Join thousands of happy customers who rent smarter with RentalHub.</p>
            <div className="about-cta-buttons">
              <Link to="/fleet"    className="btn btn-primary">Browse Fleet</Link>
              <Link to="/contact"  className="btn btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
