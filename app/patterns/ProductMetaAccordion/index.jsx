export function ProductMetaAccordion({metafields}) {
  console.log('metafields', metafields);

  return (
    <div className="meta-accordion" role="region" aria-label="Product details">
      {/* <section>{metafields}</section> */}

      {/* {items.map(({label, value}) => (
        <details key={label} className="acc-item">
          <summary>
            <span className="acc-title">{label}</span>
            <span className="acc-plus" aria-hidden />
          </summary>
          <div className="acc-panel">
            <p>{value}</p>
          </div>
        </details>
      ))} */}
    </div>
  );
}
