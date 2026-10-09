import mosqueImage from '../assets/welcome-mosque.jpg';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <main className="welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-hero" aria-hidden="true">
        <img src={mosqueImage} alt="" />
        <div className="welcome-vignette" />
      </div>

      <section className="welcome-content">
        <h1 id="welcome-title">Assalamu Alaikum!</h1>
        <p>Your Muslim Lifestyle Companion</p>
        <button type="button" className="welcome-start" onClick={onGetStarted}>
          Get Started
        </button>
        <div className="welcome-home-indicator" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}
