import {useEffect, useRef, useState} from 'react';

export default function IntroAnimation({
  oncePerSession = true,
  storageKey = 'neoCraftIntroSeen',
  showMainAfterMs = 5200,
  hideIntroAfterMs = 5700,
}) {
  const [showIntro, setShowIntro] = useState(false);
  const [mainVisible, setMainVisible] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    // prefers-reduced-motion => keine Intro-Animation
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
    setMainVisible(!shouldShow);

    if (!shouldShow) return;

    if (oncePerSession) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {}
    }

    timers.current.push(
      setTimeout(() => setMainVisible(true), showMainAfterMs),
    );
    timers.current.push(
      setTimeout(() => setShowIntro(false), hideIntroAfterMs),
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [oncePerSession, storageKey, showMainAfterMs, hideIntroAfterMs]);

  timers.current.push(
    setTimeout(() => {
      setMainVisible(true);
      document.body.classList.add('intro-done');
    }, showMainAfterMs),
  );

  useEffect(() => {
    if (!showIntro) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showIntro]);

  return (
    <>
      {showIntro && (
        <div className="animation-container" aria-hidden="true">
          <div className="letter n">N</div>
          <div className="letter c">C</div>
          <div className="brand-reveal">NEO CRAFT</div>
          <div className="purple-overlay" />
        </div>
      )}

      {/* Diese Klasse kannst du im Layout nutzen, um z.B. initiale Opacity zu steuern */}
      <div className={`intro-main ${mainVisible ? 'visible' : ''}`} />
    </>
  );
}
