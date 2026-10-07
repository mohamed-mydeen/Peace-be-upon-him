import { Link } from 'react-router-dom';
import { Compass, BookOpen, MessageSquare, Heart } from 'lucide-react';
import { HADITH_CATEGORIES } from '../services/hadith';

export default function Explore() {
  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="page-header text-center" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '50%', marginBottom: '16px', color: 'var(--color-primary)' }}>
            <Compass size={32} />
          </div>
          <h1 className="page-title">Explore Topics</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            உங்கள் வாழ்க்கைக்கு தேவையான இஸ்லாமிய வழிகாட்டுதல்கள்
          </p>
        </div>

        <div className="section" style={{ paddingTop: 0 }}>
          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <Link to="/explore/situations" className="card card-hover" style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}>
              <Heart size={32} style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Find Guidance</h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>What are you feeling right now?</p>
            </Link>
            <Link to="/quran" className="card card-hover" style={{ padding: '2rem', textAlign: 'center' }}>
              <BookOpen size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Read Quran</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Explore by Surah</p>
            </Link>
            <Link to="/hadith" className="card card-hover" style={{ padding: '2rem', textAlign: 'center' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-gold)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Read Hadith</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Authentic Collections</p>
            </Link>
          </div>

          <div className="section-header">
            <h2 className="section-title">All Topics</h2>
          </div>
          
          <div className="grid-4">
            {HADITH_CATEGORIES.map(cat => (
              <Link 
                key={cat.id} 
                to={`/hadith/categories/${cat.id}`} 
                className="card card-hover"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.name}</span>
                <span className="tamil-text" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{cat.tamil}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
