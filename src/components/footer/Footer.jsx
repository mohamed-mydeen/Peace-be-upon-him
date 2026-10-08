import { Link } from 'react-router-dom';
import { MonitorPlay, Camera, BookOpen, MessageSquare, Heart, Hash, Compass } from 'lucide-react';
import './Footer.css';

const FOOTER_LINKS = {
  Platform: [
    { to: '/quran', label: 'Quran' },
    { to: '/hadith', label: 'Hadith' },
    { to: '/dua', label: 'Dua Library' },
    { to: '/dhikr', label: 'Dhikr Counter' },
    { to: '/explore', label: 'Explore Topics' },
    { to: '/library', label: 'My Library' },
  ],
  Collections: [
    { to: '/hadith/bukhari', label: 'Sahih al-Bukhari' },
    { to: '/hadith/muslim', label: 'Sahih Muslim' },
    { to: '/hadith/abu-dawud', label: 'Sunan Abu Dawud' },
    { to: '/hadith/tirmidzi', label: "Jami' at-Tirmidhi" },
  ],
  Information: [
    { to: '/about', label: 'About Us' },
    { to: '/youtube', label: 'YouTube Channel' },
    { to: '/about#privacy', label: 'Privacy Policy' },
    { to: '/about#terms', label: 'Terms of Use' },
    { to: '/about#contact', label: 'Contact' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/channels4_profile.jpg" alt="Peace be upon him Logo" className="footer-logo-img" />
              <span className="footer-logo-name">Peace be upon him</span>
            </Link>
            <p className="footer-desc footer-desc-en">
              Tamil Islamic knowledge platform — Quran, Hadith, Dua and more, presented with source references for the Tamil Muslim community.
            </p>
            <p className="footer-desc tamil-text" style={{ fontFamily: 'var(--font-tamil)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              தமிழ் முஸ்லிம் சமூகத்திற்காக குர்ஆன், ஹதீஸ், துஆ மற்றும் இஸ்லாமிய அறிவை நம்பகமான சான்றுகளுடன் வழங்குகிறோம்.
            </p>

            {/* Social */}
            <div className="footer-social">
              <a
                href="https://www.youtube.com/@Peacebeuponhim"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="YouTube Channel"
              >
                <MonitorPlay size={18} aria-hidden="true" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/peace_be_upon_him__?stkn=MW5uY2RrNWZqbXc1Ng=="
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <Camera size={18} aria-hidden="true" />
                Instagram
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-grid">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section} className="footer-link-group">
                <h3 className="footer-link-heading">{section}</h3>
                <ul className="footer-link-list">
                  {links.map(({ to, label }) => (
                    <li key={to}>
                      <Link to={to} className="footer-link">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <p>
              Islamic content is presented with source references. For complex religious rulings, please consult qualified scholars.
            </p>
            <p className="tamil-text" style={{ fontFamily: 'var(--font-tamil)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              இஸ்லாமிய உள்ளடக்கம் சான்றுகளுடன் வழங்கப்படுகிறது. சிக்கலான மத விஷயங்களில் தகுந்த ஆலிம்களை அணுகவும்.
            </p>
          </div>
          <p className="footer-copy">
            © {year} Peace be upon him. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
