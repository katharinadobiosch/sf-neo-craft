import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {ProductMetaAccordion} from '../ProductMetaAccordion';

type Props = {
  mfMeasurements?: unknown[];
  mfOthers?: unknown[];
  product?: unknown;
  title?: string;
};

export function ProductDetailsSection({
  mfMeasurements = [],
  mfOthers = [],
  product,
  title = 'Details',
}: Props) {
  const [open, setOpen] = useState(false);

  const reactId = useId();
  const panelId = `pf-details-${reactId}`;

  const allMetafields = useMemo(
    () => [...mfMeasurements, ...mfOthers].filter(Boolean),
    [mfMeasurements, mfOthers],
  );

  if (allMetafields.length === 0) return null;

  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [detailsHeight, setDetailsHeight] = useState<number>(0);

  // misst Content-Höhe, damit max-height animierbar ist
  useEffect(() => {
    if (!open) return;

    const raf = requestAnimationFrame(() => {
      const el = detailsRef.current;
      if (!el) return;
      setDetailsHeight(el.scrollHeight || 0);
    });

    return () => cancelAnimationFrame(raf);
  }, [open, allMetafields.length]);

  // bei Resize neu messen (sonst bricht Desktop gerne)
  useEffect(() => {
    const onResize = () => {
      if (!open) return;
      const el = detailsRef.current;
      if (!el) return;
      setDetailsHeight(el.scrollHeight || 0);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  return (
    <section className="pf-section pf-section--details" data-open={open}>
      <div className="cfg-head">
        <button
          type="button"
          className="cfg-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="cfg-title">{title}</span>
          <span
            className={`cfg-plus ${open ? 'is-open' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id={panelId}
        className="cfg-panel pf-details-panel"
        // max-height animiert, 0 wenn zu
        style={{maxHeight: open ? detailsHeight : 0}}
      >
        {/* ref misst die echte Inhaltshöhe */}
        <div ref={detailsRef} className="pf-details-panel__inner">
          {/* Scroll passiert HIER drin */}
          <div className="pf-panel-scroll nice-scrollbar">
            <div className="product__meta">
              <ProductMetaAccordion
                metafields={allMetafields}
                product={product}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
