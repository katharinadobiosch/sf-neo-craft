import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import './aside.scss';

/**
 * A side bar component with Overlay
 * @example
 * <Aside type="search" heading="SEARCH">...</Aside>
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') close();
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal="true"
      className={`overlay ${expanded ? 'expanded' : ''}`}
      data-aside-type={type}
      role="dialog"
    >
      <button
        type="button"
        className="close-outside"
        onClick={close}
        aria-label="Close dialog"
      />
      <aside data-aside-type={type}>
        <header>
          <h3>{heading}</h3>
          <button
            type="button"
            className="close reset"
            onClick={close}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

/**
 * IMPORTANT:
 * - avoid attaching to Aside.Provider directly (HMR/SSR can detach it)
 * - dedicated export stays more reliable
 */
export function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  const open = useCallback((nextType) => setType(nextType), []);
  const close = useCallback(() => setType('closed'), []);

  const value = useMemo(() => ({type, open, close}), [type, open, close]);

  return (
    <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
  );
}

export function useAside() {
  const aside = useContext(AsideContext);

  // Dev/HMR: kurzzeitige "Provider fehlt"-Momente nicht als SSR-500 eskalieren lassen
  if (!aside) {
    if (import.meta?.hot) {
      return {type: 'closed', open: () => {}, close: () => {}};
    }
    throw new Error('useAside must be used within an AsideProvider');
  }

  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
