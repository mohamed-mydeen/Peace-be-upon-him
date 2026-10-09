import { useMemo, useRef, useState } from 'react';
import { Pause, Play, Search, Sparkles, Square, Volume2 } from 'lucide-react';
import { NAMES_OF_ALLAH } from '../services/namesOfAllah';
import './NamesOfAllah.css';

export default function NamesOfAllah() {
  const [query, setQuery] = useState('');
  const [playingNumber, setPlayingNumber] = useState(null);
  const [playbackMode, setPlaybackMode] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef(null);
  const playbackRun = useRef(0);
  const queueIndex = useRef(0);

  const filteredNames = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return NAMES_OF_ALLAH;
    return NAMES_OF_ALLAH.filter(({ arabic, transliteration, meaning, meaningTamil, number }) => (
      arabic.includes(query.trim()) ||
      transliteration.toLocaleLowerCase().includes(normalizedQuery) ||
      meaning.toLocaleLowerCase().includes(normalizedQuery) ||
      meaningTamil.includes(query.trim()) ||
      String(number) === normalizedQuery
    ));
  }, [query]);

  const stopPlayback = () => {
    playbackRun.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setPlayingNumber(null);
    setPlaybackMode(null);
    setIsPaused(false);
  };

  const playFromIndex = (index, mode, run) => {
    const name = NAMES_OF_ALLAH[index];
    const audio = audioRef.current;
    if (!name || !audio || run !== playbackRun.current) return;

    queueIndex.current = index;
    setQueuePosition(index + 1);
    setPlayingNumber(name.number);
    setAudioError('');

    const failPlayback = error => {
      if (run !== playbackRun.current) return;
      setAudioError(
        `Arabic audio could not play${error?.message ? `: ${error.message}` : ''}. Check your internet connection and try again.`,
      );
      setPlayingNumber(null);
      setPlaybackMode(null);
      setIsPaused(false);
    };

    audio.onended = () => {
      if (run !== playbackRun.current) return;
      if (mode === 'all' && queueIndex.current + 1 < NAMES_OF_ALLAH.length) {
        playFromIndex(queueIndex.current + 1, mode, run);
      } else {
        setPlayingNumber(null);
        setPlaybackMode(null);
        setIsPaused(false);
      }
    };
    audio.onerror = () => {
      if (run !== playbackRun.current) return;
      failPlayback(new Error('The audio file could not be loaded'));
    };

    audio.src = `/api/names-audio?number=${name.number}`;
    audio.load();
    audio.play().catch(failPlayback);
  };

  const playOne = name => {
    stopPlayback();
    const run = ++playbackRun.current;
    setPlaybackMode('single');
    playFromIndex(name.number - 1, 'single', run);
  };

  const playAll = () => {
    stopPlayback();
    const run = ++playbackRun.current;
    setPlaybackMode('all');
    playFromIndex(0, 'all', run);
  };

  const togglePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPaused) {
      audio.play().catch(error => {
        setAudioError(`Audio could not resume: ${error.message}`);
      });
      setIsPaused(false);
    } else {
      audio.pause();
      setIsPaused(true);
    }
  };

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container names-page">
        <header className="names-header">
          <span className="names-header-icon" aria-hidden="true"><Sparkles size={25} /></span>
          <h1>Allah’s Beautiful Names</h1>
          <p className="tamil-text">அல்லாஹ்வின் அழகிய திருநாமங்கள்</p>
          <p className="names-note">
            Commonly circulated list of 99 names; translations are brief explanations and may vary.
          </p>
        </header>

        <section className="names-audio-panel" aria-label="Arabic name audio">
          <div className="names-audio-row">
            <span className="names-audio-label"><Volume2 size={17} aria-hidden="true" /> Arabic audio</span>
            <div className="names-audio-controls">
              {playbackMode ? (
                <>
                  <button className="btn btn-secondary" onClick={togglePause}>
                    {isPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button className="btn btn-ghost" onClick={stopPlayback}>
                    <Square size={14} fill="currentColor" aria-hidden="true" />
                    Stop
                  </button>
                </>
              ) : (
                <button className="btn btn-primary names-play-all" onClick={playAll}>
                  <Play size={15} fill="currentColor" aria-hidden="true" />
                  Play all 99
                </button>
              )}
            </div>
          </div>
          <p className="names-audio-status" aria-live="polite">
            {playbackMode === 'all'
              ? `Playing ${queuePosition} of 99`
              : playbackMode === 'single' && playingNumber
                ? `Playing name ${playingNumber}`
                : 'Generated Arabic voice · requires internet'}
          </p>
          {audioError && <p className="names-audio-error" role="alert">{audioError}</p>}
          <audio ref={audioRef} preload="none" />
        </section>

        <label className="names-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search name or meaning..."
            aria-label="Search Allah's names"
          />
          <span>{filteredNames.length} / 99</span>
        </label>

        {filteredNames.length ? (
          <ol className="names-grid">
            {filteredNames.map(name => (
              <li className={`name-card card${playingNumber === name.number ? ' is-playing' : ''}`} key={name.number}>
                <span className="name-number">{String(name.number).padStart(2, '0')}</span>
                <p className="name-arabic arabic-text" lang="ar" dir="rtl">{name.arabic}</p>
                <h2>{name.transliteration}</h2>
                <p className="name-meaning tamil-text">{name.meaningTamil}</p>
                <p className="name-meaning-english">{name.meaning}</p>
                <button
                  className="name-play-button"
                  type="button"
                  onClick={() => playOne(name)}
                  aria-label={`Play ${name.transliteration} in Arabic`}
                >
                  <Volume2 size={15} aria-hidden="true" />
                  Listen
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="names-empty">No names match your search. Try another name or meaning.</p>
        )}

        <p className="names-reference">Quran 7:180 · Quran 17:110 · Quran 59:22-24</p>
      </div>
    </main>
  );
}
