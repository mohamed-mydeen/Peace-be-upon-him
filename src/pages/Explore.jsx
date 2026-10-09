import { useParams, Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Heart, ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import { HADITH_CATEGORIES } from '../services/hadith';
import PageHero from '../components/PageHero';
import exploreBanner from '../assets/explore-banner.svg';
import './Explore.css';

const SITUATIONS = [
  { id: 'sad', title: "I'm feeling sad", tamil: 'நான் கவலையாக உள்ளேன்', icon: '😔', mapTo: 'sabr' },
  { id: 'anger', title: "I'm struggling with anger", tamil: 'எனக்கு கோபம் வருகிறது', icon: '😠', mapTo: 'anger' },
  { id: 'repent', title: "I want to repent", tamil: 'நான் பாவமன்னிப்பு தேட விரும்புகிறேன்', icon: '🤲', mapTo: 'tawbah' },
  { id: 'parents', title: "I need guidance about parents", tamil: 'பெற்றோரை பற்றி வழிகாட்டுதல்', icon: '👨‍👩‍👧‍👦', mapTo: 'parents' },
  { id: 'salah', title: "I want to improve my Salah", tamil: 'தொழுகையை மேம்படுத்த', icon: '🕌', mapTo: 'salah' },
  { id: 'iman', title: "I want to increase my Iman", tamil: 'ஈமானை அதிகப்படுத்த', icon: '✨', mapTo: 'iman' },
  { id: 'tawheed', title: "I want to learn about Tawheed", tamil: 'தவ்ஹீத் பற்றி அறிய', icon: '☝️', mapTo: 'tawheed' },
];

export default function Explore() {
  const { topic } = useParams();

  if (topic === 'situations') {
    return (
      <main className="page-wrapper fade-in" id="main-content">
        <div className="container">
          <Link to="/explore" className="back-link">
            <ArrowLeft size={16} /> Back to Explore
          </Link>
          
          <PageHero
            image={exploreBanner}
            title="Find Guidance"
            description="உணர்வு ரீதியான வழிகாட்டுதல்கள்"
            className="explore-page-hero"
          />

          <div className="situations-grid">
            {SITUATIONS.map(sit => (
              <Link 
                key={sit.id} 
                to={`/hadith/categories/${sit.mapTo}`} 
                className="card card-hover situation-card"
              >
                <span className="topic-icon">{sit.icon}</span>
                <span className="topic-name">{sit.title}</span>
                <span className="topic-tamil tamil-text">{sit.tamil}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <PageHero
          image={exploreBanner}
          title="Explore Topics"
          description="உங்கள் வாழ்க்கைக்கு தேவையான இஸ்லாமிய வழிகாட்டுதல்கள்"
          className="explore-page-hero"
        />

        <div className="section" style={{ paddingTop: 0 }}>
          <div className="explore-main-grid">
            <Link to="/explore/situations" className="card card-hover explore-main-card primary">
              <span className="explore-main-icon"><Heart size={21} aria-hidden="true" /></span>
              <div className="explore-main-copy"><h2>Find Guidance</h2><p>What are you feeling right now?</p></div>
            </Link>
            <Link to="/quran" className="card card-hover explore-main-card">
              <span className="explore-main-icon"><BookOpen size={21} aria-hidden="true" /></span>
              <div className="explore-main-copy"><h2>Read Quran</h2><p>Explore by Surah</p></div>
            </Link>
            <Link to="/hadith" className="card card-hover explore-main-card">
              <span className="explore-main-icon"><MessageSquare size={21} aria-hidden="true" /></span>
              <div className="explore-main-copy"><h2>Read Hadith</h2><p>Authentic Collections</p></div>
            </Link>
            <Link to="/lessons" className="card card-hover explore-main-card">
              <span className="explore-main-icon"><GraduationCap size={21} aria-hidden="true" /></span>
              <div className="explore-main-copy"><h2>Islamic Lessons</h2><p>Aqidah, Fiqh, Seerah, and Akhlaq</p></div>
            </Link>
            <Link to="/names-of-allah" className="card card-hover explore-main-card">
              <span className="explore-main-icon"><Sparkles size={21} aria-hidden="true" /></span>
              <div className="explore-main-copy"><h2>Allah’s Beautiful Names</h2><p className="tamil-text">அல்லாஹ்வின் அழகிய திருநாமங்கள்</p></div>
            </Link>
          </div>

          <div className="section-header">
            <h2 className="section-title">All Topics</h2>
          </div>
          
          <div className="explore-topics-grid">
            {HADITH_CATEGORIES.map(cat => (
              <Link 
                key={cat.id} 
                to={`/hadith/categories/${cat.id}`} 
                className="card card-hover topic-card"
              >
                <span className="topic-icon">{cat.icon}</span>
                <span className="topic-name">{cat.name}</span>
                <span className="topic-tamil tamil-text">{cat.tamil}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
