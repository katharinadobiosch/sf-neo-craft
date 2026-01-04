import {useEffect, useRef, useState} from 'react';

export default function IntroAnimation({
  oncePerSession = true,
  storageKey = 'neoCraftIntroSeen',
  showMainAfterMs = 5200,
  hideIntroAfterMs = 5700,
}) {
  const [showIntro, setShowIntro] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const shouldShow = (() => {
      if (reduce) return false;
      if (!oncePerSession) return true;
      try {
        return sessionStorage.getItem(storageKey) !== '1';
      } catch {
        return true;
      }
    })();

    setShowIntro(shouldShow);

    // Wenn kein Intro: Content sofort freigeben
    if (!shouldShow) {
      document.body.classList.add('intro-done');
      return;
    }

    if (oncePerSession) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {}
    }

    // Content freigeben
    timers.current.push(
      setTimeout(() => {
        document.body.classList.add('intro-done');
      }, showMainAfterMs),
    );

    // Overlay entfernen
    timers.current.push(
      setTimeout(() => {
        setShowIntro(false);
      }, hideIntroAfterMs),
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      // intro-done NICHT entfernen, sonst kann es bei Navigation wieder “zu” gehen
    };
  }, [oncePerSession, storageKey, showMainAfterMs, hideIntroAfterMs]);

  useEffect(() => {
    if (!showIntro) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showIntro]);

  if (!showIntro) return null;

  return (
    <div className="animation-container" aria-hidden="true">
      <div className="letter n">N</div>
      <div className="letter c">C</div>
      <div className="brand-reveal">NEO CRAFT</div>
      <div className="purple-overlay" />
    </div>
  );
}
