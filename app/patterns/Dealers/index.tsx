import React from 'react';

export type Dealer = {
  id: string;
  country: string;
  name: string;
  city: string;
  website: string;
};

type Props = {items: Dealer[]};

const toHref = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export default function Dealers({items}: Props) {
  if (!items?.length) {
    return (
      <main className="page">
        <p style={{padding: 24}}>No dealers found.</p>
      </main>
    );
  }

  // 👉 Debug-Ausgabe: alle Metaobjekte so, wie sie reinkommen
  console.log('All dealer metaobjects:', items);

  // Nach Land gruppieren
  const byCountry = items.reduce<Record<string, Dealer[]>>((acc, d) => {
    const key = d.country?.trim() || '—';
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  // Länder alphabetisch
  const countries = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));

  console.log('Grouped by country:', byCountry);
  console.log('Countries sorted:', countries);

  return (
    <main className="dealers">
      {countries.map((country) => {
        const rows = byCountry[country]
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name));

        return (
          <div className="dealers__container" key={country}>
            <div className="dealers__country">{country}</div>

            <div className="dealers__entries">
              {rows.map((d) => (
                <div className="dealers__entry" key={d.id}>
                  <div className="dealers__line">
                    <span className="dealers__name">{d.name}</span>
                    {d.city ? <span>, {d.city}</span> : null}
                  </div>

                  {d.website ? (
                    <a
                      className="dealers__link"
                      href={toHref(d.website)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {d.website}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}
