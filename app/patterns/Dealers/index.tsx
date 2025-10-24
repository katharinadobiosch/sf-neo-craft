import React from 'react';

export default function Dealers({dealers}) {
  if (!dealers || dealers.length === 0) {
    return (
      <div className="page">
        <p style={{padding: 24}}>No dealers found.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <button className="hamburger" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div className="brand">N</div>
        <div className="corner">C</div>
      </header>

      <main className="content">
        <section className="table">
          {dealers.map((d, idx) => (
            <div className="row" key={d.country + idx}>
              <div className="col country">{d.country}</div>
              <div className="col entries">
                {d.cities.map((c, i) => (
                  <div className="entry" key={i}>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bottombar">
        <nav className="links">
          {[
            'CONTACT',
            'ABOUT',
            'COLLECTION',
            'MATERIALS',
            'PROJECTS',
            'BESPOKE',
            'DEALERS',
            'DOWNLOADS',
            'TERMS & CONDITIONS',
          ].map((l) => (
            <a href="#" key={l}>
              {l}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
