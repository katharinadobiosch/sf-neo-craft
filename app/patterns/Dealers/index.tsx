import React from 'react';

export type Dealer = {
  id: string;
  country: string;
  name: string;
  city: string;
  website: string;
};

type Props = {items: Dealer[]};

export default function Dealers({items}: Props) {
  if (!items?.length) {
    return (
      <main className="page">
        <p style={{padding: 24}}>No dealers found.</p>
      </main>
    );
  }

  // Nach Land gruppieren
  const byCountry = items.reduce<Record<string, Dealer[]>>((acc, d) => {
    const key = d.country?.trim() || '—';
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  // Länder alphabetisch
  const countries = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));

  return (
    <main className="page">
      <section className="dealers-grid">
        {countries.map((country) => {
          const rows = byCountry[country]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
          return (
            <React.Fragment key={country}>
              <div className="country">{country.toUpperCase()}</div>
              <div className="entries">
                {rows.map((d) => (
                  <div className="entry" key={d.id}>
                    <div className="name">{d.name}</div>
                    <div className="city">{d.city}</div>
                    <div className="link">
                      {d.website ? (
                        <a
                          href={
                            /^https?:\/\//i.test(d.website)
                              ? d.website
                              : `https://${d.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {d.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          );
        })}
      </section>
    </main>
  );
}
