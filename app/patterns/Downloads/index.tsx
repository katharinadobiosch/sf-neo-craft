const DOWNLOAD_ITEMS = [
  {
    label: 'Catalogue',
    href: '',
  },
  {
    label: 'Pricelists',
    href: '',
  },
  {
    label: '2D Files',
    href: '',
  },
  {
    label: '3D Files',
    href: '',
  },
];

export default function Downloads() {
  return (
    <section className="downloads" aria-label="Downloads">
      <div className="downloads__list">
        {DOWNLOAD_ITEMS.map((item) =>
          item.href ? (
            <a
              key={item.label}
              className="downloads__row"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{item.label}</span>
            </a>
          ) : (
            <div
              key={item.label}
              className="downloads__row downloads__row--missing-link"
            >
              <span>{item.label}</span>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
