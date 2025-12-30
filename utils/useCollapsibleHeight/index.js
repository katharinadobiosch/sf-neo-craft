import {useEffect, useLayoutEffect, useRef, useState} from 'react';

export function useCollapsibleHeight(isOpen, deps = []) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  const measure = () => {
    const el = innerRef.current;
    if (!el) return;
    setHeight(el.scrollHeight || 0);
  };

  // Messen beim Öffnen / Content-Änderungen
  useLayoutEffect(() => {
    if (!isOpen) return;
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ...deps]);

  // Resize
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  return {innerRef, height, measure};
}
