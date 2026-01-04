import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const AsideContext = createContext(null);

export function AsideProvider({children}) {
  const [activeType, setActiveType] = useState(null);

  const open = useCallback((type) => setActiveType(type), []);
  const close = useCallback(() => setActiveType(null), []);

  const value = useMemo(
    () => ({activeType, open, close}),
    [activeType, open, close],
  );

  return (
    <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
  );
}

export function useAside() {
  const ctx = useContext(AsideContext);

  // Dev/HMR: lieber "no-op" als SSR-500 durch kurzzeitige Context-Duplikate
  if (!ctx) {
    if (import.meta?.hot) {
      return {activeType: null, open: () => {}, close: () => {}};
    }
    throw new Error('useAside must be used within an AsideProvider');
  }

  return ctx;
}
