import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './ReciterPicker.css';

export default function ReciterPicker({ reciters, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listboxId = useId();
  const selectedIndex = reciters.findIndex(reciter => String(reciter.id) === String(value));
  const selectedReciter = reciters[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectReciter = index => {
    const reciter = reciters[index];
    if (!reciter) return;
    onChange(reciter.id);
    setActiveIndex(index);
    setOpen(false);
  };

  const handleTriggerKeyDown = event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
        setOpen(true);
        return;
      }
      setActiveIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + reciters.length) % reciters.length);
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(reciters.length - 1);
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      selectReciter(activeIndex);
    }
  };

  return (
    <div className="reciter-picker" ref={rootRef}>
      <button
        type="button"
        className={`reciter-picker-trigger${open ? ' is-open' : ''}`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => {
          setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
          setOpen(current => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="reciter-picker-value">{selectedReciter?.name ?? 'Choose a reciter'}</span>
        <ChevronDown className="reciter-picker-chevron" size={18} aria-hidden="true" />
      </button>
      {open && (
        <ul className="reciter-picker-menu" id={listboxId} role="listbox" aria-label={label}>
          {reciters.map((reciter, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={reciter.id}
                id={`${listboxId}-option-${index}`}
                className={`reciter-picker-option${isSelected ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={event => event.preventDefault()}
                onClick={() => selectReciter(index)}
              >
                <span>{reciter.name}</span>
                {isSelected && <Check size={17} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
