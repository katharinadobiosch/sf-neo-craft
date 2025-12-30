import {useEffect, useId, useRef, useState} from 'react';

export function ProductShippingSection({
  title = 'Lead time + shipping',
  lines = [],
  defaultOpen = false,
  idPrefix = 'pf-shipping',
}) {
  const [open, setOpen] = useState(defaultOpen);

  const scrollRef = useRef(null);
  const [height, setHeight] = useState(0);

  const reactId = useId();
  const panelId = `${idPrefix}-${reactId}`;

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (scrollRef.current) {
        setHeight(scrollRef.current.scrollHeight || 0);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open, lines.length]);

  useEffect(() => {
    const onResize = () => {
      if (open && scrollRef.current) {
        setHeight(scrollRef.current.scrollHeight || 0);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  const safeLines = Array.isArray(lines) ? lines.filter(Boolean) : [];

  return (
    <div className="shipping-item" data-open={open}>
      <button
        type="button"
        className="shipping-summary"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cfg-title">{title}</span>
        <span
          className={`shipping-plus ${open ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        className="pf-panel pf-panel--shipping"
        style={{maxHeight: open ? height + 10 : 0}}
      >
        <div className="pf-panel-inner">
          <div ref={scrollRef} className="pf-panel-scroll nice-scrollbar">
            {safeLines.length > 0 && (
              <div className="shipping-panel">
                {safeLines.map((line, i) => (
                  <span key={`${i}-${line}`}>{line}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
