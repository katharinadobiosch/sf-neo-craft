import {useEffect, useId, useRef, useState} from 'react';
import {ProductMetaAccordion} from '../ProductMetaAccordion';

export function ProductDetailsSection({
  mfMeasurements = [],
  mfOthers = [],
  product,
  title = 'Details',
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  // stabiler, eindeutiger ID für aria-controls
  const reactId = useId();
  const panelId = `pf-details-${reactId}`;

  const hasAny =
    (Array.isArray(mfMeasurements) && mfMeasurements.length > 0) ||
    (Array.isArray(mfOthers) && mfOthers.length > 0);

  // Height messen (wie bei dir im ProductForm)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight || 0);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open, mfMeasurements.length, mfOthers.length, product]);

  useEffect(() => {
    const onResize = () => {
      if (open && contentRef.current) {
        setHeight(contentRef.current.scrollHeight || 0);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  if (!hasAny) return null;

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
        style={{maxHeight: open ? height + 10 : 0}}
      >
        <div ref={contentRef} className="cfg-panel-inner">
          <div className="pf-section__body pf-section__body--flex nice-scrollbar">
            <div className="configurator__meta">
              <ProductMetaAccordion
                metafields={[...mfMeasurements, ...mfOthers]}
                product={product}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
