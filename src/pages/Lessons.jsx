import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { getLesson, getLessonsBySubject, getLessonSubject, LESSON_SUBJECTS } from '../services/lessons';
import './Lessons.css';

function LessonDetail({ subject, lesson }) {
  return (
    <>
      <Link to={`/lessons/${subject.id}`} className="back-link">
        <ArrowLeft size={16} /> {subject.title} lessons
      </Link>
      <article className="lesson-detail card">
        <span className="lesson-subject-kicker">{subject.icon} {subject.title}</span>
        <h1>{lesson.title}</h1>
        <p className="lesson-tamil-title tamil-text">{lesson.tamil}</p>
        {lesson.sections.map(section => (
          <section className="lesson-notes-section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.english}</p>
            <h3 className="tamil-text">{section.titleTamil}</h3>
            <p className="tamil-text">{section.tamil}</p>
          </section>
        ))}
        <section className="lesson-references" aria-label="References">
          <h2>References</h2>
          <ul>{lesson.references.map(reference => <li key={reference}>{reference}</li>)}</ul>
        </section>
      </article>
      <p className="lesson-disclaimer">
        Introduction only — these notes are not a complete course or full coverage of the topic. For detailed Fiqh rulings or personal situations, consult a qualified scholar.
      </p>
    </>
  );
}

export default function Lessons() {
  const { subjectId, lessonId } = useParams();
  const subject = subjectId ? getLessonSubject(subjectId) : null;
  const lesson = subject && lessonId ? getLesson(subject.id, lessonId) : null;

  if (lessonId && (!subject || !lesson)) {
    return (
      <main className="page-wrapper fade-in" id="main-content">
        <div className="container lessons-container">
          <p className="lessons-empty">This lesson could not be found.</p>
          <Link to="/lessons" className="btn btn-secondary">Browse lessons</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container lessons-container">
        {subject && (
          <Link to="/lessons" className="back-link">
            <ArrowLeft size={16} /> All subjects
          </Link>
        )}
        <header className="lessons-header">
          <span className="lessons-header-icon" aria-hidden="true">{subject?.icon || <BookOpen size={30} />}</span>
          <h1>{subject ? `${subject.title} Lessons` : 'Islamic Lessons'}</h1>
          <p className="tamil-text">
            {subject ? `${subject.tamil} — ${subject.description}` : 'அடிப்படை இஸ்லாமிய அறிமுகப் பாடங்களை தமிழிலும் ஆங்கிலத்திலும் கற்கவும்'}
          </p>
          <p className="lessons-intro-note">
            <strong>Introduction only</strong>
            <span>These lessons are not a complete course or full coverage of each topic.</span>
            <span className="tamil-text">இவை அறிமுகப் பாடங்கள் மட்டுமே; முழுமையான பாடத்திட்டம் அல்ல.</span>
          </p>
        </header>

        {lesson ? (
          <LessonDetail subject={subject} lesson={lesson} />
        ) : subject ? (
          <div className="lessons-list">
            {getLessonsBySubject(subject.id).map((item, index) => (
              <Link key={item.id} to={`/lessons/${subject.id}/${item.id}`} className="card card-hover lesson-card">
                <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="lesson-card-copy">
                  <strong>{item.title}</strong>
                  <span className="tamil-text">{item.tamil}</span>
                  <span className="lesson-card-reference">{item.references.join(' · ')}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="lesson-subjects-grid">
            {LESSON_SUBJECTS.map(item => (
              <Link key={item.id} to={`/lessons/${item.id}`} className="card card-hover lesson-subject-card">
                <span className="lesson-subject-icon" aria-hidden="true">{item.icon}</span>
                <h2>{item.title}</h2>
                <span className="tamil-text">{item.tamil}</span>
                <p>{item.description}</p>
                <span className="lesson-count">{getLessonsBySubject(item.id).length} starter lessons</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
