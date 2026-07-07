import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Data proyek yang ditautkan dari halaman ini.
// Tambah / ubah objek di array ini untuk menambah kartu baru.
// ---------------------------------------------------------------------------
const PROJECTS = [
  {
    tag: 'GAME',
    glyph: 'wave',
    title: 'Susur Sungai',
    desc: 'Game penjelajahan berbasis peta yang mengasah logika arah dan navigasi sambil menyusuri alur sungai.',
    href: 'https://susur-sungai-game.vercel.app/',
    previewUrl: 'https://susur-sungai-game.vercel.app/', // URL yang sama untuk iframe
  },
  {
    tag: 'SEGERA',
    glyph: 'pin',
    title: 'Proyek berikutnya',
    desc: 'Titik koordinat baru sedang dipetakan. Tempatkan proyek belajarmu berikutnya di sini.',
    href: null,
    previewUrl: null,
  },
]

const COMMANDS = [
  'forward(140)',
  'right(72)',
  'forward(140)',
  'right(72)',
  'forward(140)',
  'right(72)',
  'forward(140)',
  'right(72)',
  'forward(140)',
  'right(72)',
]

// Path pentagon dipakai untuk animasi "gambar" di hero (SVG viewBox 0 0 400 400)
const PENTAGON_D =
  'M200,60 L333.15,156.74 L282.29,313.26 L117.71,313.26 L66.85,156.74 Z'
const PENTAGON_LEN = 823

function Glyph({ type }) {
  if (type === 'polygon') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M12 3 L21 9.5 L17.8 20 L6.2 20 L3 9.5 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'wave') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M2 9c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M2 15c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function GeoTurtleLanding() {
  const [cmdIndex, setCmdIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCmdIndex((i) => (i + 1) % COMMANDS.length)
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="gt-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap');

        /* Reset dan base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          overflow: hidden;
        }

        .gt-root {
          --ink: #101c24;
          --panel: #182934;
          --panel-hi: #1f3644;
          --line: #2b4353;
          --copper: #c97c4d;
          --copper-hi: #e0996a;
          --moss: #7fb69e;
          --paper: #ece5d6;
          --paper-dim: #a9b6bd;
          font-family: 'Newsreader', Georgia, serif;
          background: var(--ink);
          color: var(--paper);
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
          position: relative;
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        .gt-root::-webkit-scrollbar {
          width: 8px;
        }
        .gt-root::-webkit-scrollbar-track {
          background: var(--ink);
        }
        .gt-root::-webkit-scrollbar-thumb {
          background: var(--line);
          border-radius: 4px;
        }
        .gt-root::-webkit-scrollbar-thumb:hover {
          background: var(--copper);
        }

        .gt-root * { box-sizing: border-box; }

        .gt-root a { color: inherit; text-decoration: none; }
        .gt-root button { font-family: inherit; }

        .gt-root :focus-visible {
          outline: 2px solid var(--moss);
          outline-offset: 3px;
        }

        .gt-grid-bg {
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 42px 42px;
          background-position: center;
          opacity: 0.35;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .gt-nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px clamp(20px, 6vw, 72px) 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .gt-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          font-size: 1.05rem;
        }

        .gt-brand-mark {
          width: 30px;
          height: 30px;
          border: 1.4px solid var(--copper);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper);
        }

        .gt-nav-link {
          font-size: 0.85rem;
          color: var(--paper-dim);
          border-bottom: 1px solid transparent;
          padding-bottom: 2px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .gt-nav-link:hover { color: var(--moss); border-color: var(--moss); }

        .gt-hero {
          position: relative;
          overflow: hidden;
          padding: clamp(48px, 9vw, 100px) clamp(20px, 6vw, 72px) clamp(56px, 8vw, 96px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
          gap: clamp(24px, 5vw, 56px);
          align-items: center;
        }

        @media (max-width: 860px) {
          .gt-hero { grid-template-columns: 1fr; }
          .gt-hero-art { order: -1; margin: 0 auto; }
        }

        .gt-eyebrow {
          position: relative;
          z-index: 2;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--moss);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gt-eyebrow::before {
          content: '';
          width: 18px;
          height: 1px;
          background: var(--moss);
        }

        .gt-h1 {
          position: relative;
          z-index: 2;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(2.6rem, 6vw, 4.4rem);
          line-height: 1.03;
          letter-spacing: -0.01em;
          margin: 0 0 20px;
        }
        .gt-h1 em {
          font-style: normal;
          color: var(--copper-hi);
        }

        .gt-lede {
          position: relative;
          z-index: 2;
          font-size: clamp(1.02rem, 1.6vw, 1.2rem);
          line-height: 1.6;
          color: var(--paper-dim);
          max-width: 46ch;
          margin: 0 0 30px;
        }

        .gt-cta-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .gt-cta {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          background: var(--copper);
          color: #17110b;
          padding: 13px 26px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .gt-cta:hover { background: var(--copper-hi); transform: translateY(-1px); }

        .gt-ticker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          color: var(--paper-dim);
        }
        .gt-ticker b {
          color: var(--moss);
          font-weight: 500;
        }

        .gt-hero-art {
          position: relative;
          width: min(100%, 380px);
          aspect-ratio: 1 / 1;
          z-index: 2;
        }

        .gt-hero-art svg { width: 100%; height: 100%; overflow: visible; }

        .gt-hero-path {
          fill: none;
          stroke: var(--moss);
          stroke-width: 2;
          stroke-linejoin: round;
          stroke-dasharray: ${PENTAGON_LEN};
          animation: gt-draw 6s ease-in-out infinite;
        }

        .gt-hero-ghost {
          fill: none;
          stroke: var(--line);
          stroke-width: 1;
          stroke-linejoin: round;
        }

        .gt-hero-dot {
          offset-path: path('${PENTAGON_D}');
          offset-rotate: 0deg;
          animation: gt-move 6s ease-in-out infinite;
        }

        @keyframes gt-draw {
          0% { stroke-dashoffset: ${PENTAGON_LEN}; }
          45%, 55% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -${PENTAGON_LEN}; }
        }
        @keyframes gt-move {
          0% { offset-distance: 0%; opacity: 1; }
          50% { offset-distance: 100%; opacity: 1; }
          51% { opacity: 0; }
          52% { offset-distance: 0%; }
          53% { opacity: 1; }
          100% { offset-distance: 0%; }
        }

        .gt-trail {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 clamp(20px, 6vw, 72px) clamp(40px, 6vw, 64px);
        }
        .gt-trail-line {
          flex: 1;
          height: 0;
          border-top: 1px dashed var(--line);
        }
        .gt-trail-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          color: var(--paper-dim);
          white-space: nowrap;
        }

        .gt-section {
          position: relative;
          z-index: 2;
          padding: 0 clamp(20px, 6vw, 72px) clamp(72px, 10vw, 120px);
        }

        .gt-section-head {
          margin-bottom: 40px;
          max-width: 60ch;
        }
        .gt-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(1.5rem, 3vw, 2rem);
          margin: 0 0 12px;
        }
        .gt-section-sub {
          color: var(--paper-dim);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }

        .gt-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
        }

        .gt-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }
        .gt-card.is-live:hover {
          border-color: var(--moss);
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .gt-card.is-placeholder {
          border-style: dashed;
          opacity: 0.72;
        }

        .gt-card-preview {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: var(--ink);
          overflow: hidden;
          border-bottom: 1px solid var(--line);
        }

        .gt-card-preview iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          pointer-events: none; /* Mencegah interaksi dengan iframe */
          transform: scale(0.8); /* Zoom out untuk melihat lebih banyak konten */
          transform-origin: top left;
          width: 125%; /* Kompensasi scale */
          height: 125%;
        }

        /* Untuk mencegah scroll di iframe preview */
        .gt-card-preview iframe::-webkit-scrollbar {
          display: none;
        }

        .gt-card-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(16, 28, 36, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
          z-index: 2;
        }

        .gt-card.is-live:hover .gt-card-preview-overlay {
          opacity: 1;
        }

        .gt-card-preview-btn {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          background: var(--copper);
          color: #17110b;
          padding: 12px 28px;
          border-radius: 4px;
          transform: translateY(10px);
          transition: transform 0.3s ease, background 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .gt-card.is-live:hover .gt-card-preview-btn {
          transform: translateY(0);
        }
        .gt-card-preview-btn:hover {
          background: var(--copper-hi);
        }

        .gt-card-preview-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          color: var(--paper-dim);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
        }

        .gt-card-preview-placeholder svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .gt-card-content {
          padding: 24px 26px 26px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        .gt-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gt-card-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: var(--copper-hi);
          border: 1px solid var(--copper);
          border-radius: 999px;
          padding: 3px 10px;
        }

        .gt-card-glyph {
          color: var(--moss);
          display: flex;
        }

        .gt-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0;
        }

        .gt-card-desc {
          font-size: 0.95rem;
          line-height: 1.55;
          color: var(--paper-dim);
          margin: 0;
          flex: 1;
        }

        .gt-card-note {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: var(--copper-hi);
          opacity: 0.8;
        }

        .gt-card-link {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--moss);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .gt-card.is-live .gt-card-link:hover { gap: 9px; }
        .gt-card-link svg { transition: transform 0.2s ease; }

        .gt-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid var(--line);
          padding: 26px clamp(20px, 6vw, 72px) 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: var(--paper-dim);
        }

        @media (max-width: 640px) {
          .gt-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gt-hero-path, .gt-hero-dot { animation: none; stroke-dashoffset: 0; }
          .gt-card.is-live:hover { transform: none; }
          .gt-card-preview-overlay { opacity: 1; }
          .gt-card-preview-btn { transform: none; }
        }

        /* Loading state untuk iframe */
        .gt-card-preview-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--paper-dim);
          font-size: 0.8rem;
          font-family: 'Space Grotesk', sans-serif;
          z-index: 1;
        }

        .gt-card-preview-loading::after {
          content: '...';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
      `}</style>

      <nav className="gt-nav">
        <div className="gt-brand">
          <span className="gt-brand-mark">
            <Glyph type="polygon" />
          </span>
          Geo Turtle
        </div>
        <a className="gt-nav-link" href="#peta">Peta proyek ↓</a>
      </nav>

      <header className="gt-hero">
        <div className="gt-grid-bg" />

        <div>
          <p className="gt-eyebrow">Portal proyek</p>
          <h1 className="gt-h1">
            Geo<br />Turtle <em>Project</em>.
          </h1>
          <p className="gt-lede">
            Geo Turtle Project adalah titik kumpul proyek pembelajaran berbasis kode buatan
            kami.
          </p>
          <div className="gt-cta-row">
            <a className="gt-cta" href="#peta">
              Jelajahi proyek
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span className="gt-ticker">
              &gt;&gt;&gt; <b>{COMMANDS[cmdIndex]}</b>
            </span>
          </div>
        </div>

        <div className="gt-hero-art">
          <svg viewBox="0 0 400 400">
            <path className="gt-hero-ghost" d={PENTAGON_D} />
            <path className="gt-hero-path" d={PENTAGON_D} />
            <circle className="gt-hero-dot" r="6" fill="#c97c4d" />
          </svg>
        </div>
      </header>

      <div className="gt-trail" aria-hidden="true">
        <span className="gt-trail-line" />
        <span className="gt-trail-label">...</span>
        <span className="gt-trail-line" />
      </div>

      <section className="gt-section" id="peta">
        <div className="gt-section-head">
          <h2 className="gt-section-title">Peta proyek</h2>
          <p className="gt-section-sub">
            Pilih salah satu untuk membuka
            proyeknya di tab baru.
          </p>
        </div>

        <div className="gt-cards">
          {PROJECTS.map((p) => {
            const isLive = Boolean(p.href)
            const Wrapper = isLive ? 'a' : 'div'
            const wrapperProps = isLive
              ? { href: p.href, target: '_blank', rel: 'noreferrer' }
              : {}
            return (
              <Wrapper
                key={p.title}
                className={`gt-card ${isLive ? 'is-live' : 'is-placeholder'}`}
                {...wrapperProps}
              >
                {/* Preview Section with iframe */}
                <div className="gt-card-preview">
                  {p.previewUrl ? (
                    <>
                      <div className="gt-card-preview-loading">Loading preview</div>
                      <iframe
                        src={p.previewUrl}
                        title={`Preview ${p.title}`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                      {isLive && (
                        <div className="gt-card-preview-overlay">
                          <span className="gt-card-preview-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Buka Proyek
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="gt-card-preview-placeholder">
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>Proyek Segera Hadir</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="gt-card-content">
                  <div className="gt-card-top">
                    <span className="gt-card-tag">{p.tag}</span>
                    <span className="gt-card-glyph">
                      <Glyph type={p.glyph || 'pin'} />
                    </span>
                  </div>
                  <h3 className="gt-card-title">{p.title}</h3>
                  <p className="gt-card-desc">{p.desc}</p>
                  {p.note && <span className="gt-card-note">{p.note}</span>}
                  {isLive && (
                    <span className="gt-card-link">
                      Buka proyek
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>
      </section>

      <footer className="gt-footer">
        <span>Geo Turtle — kumpulan proyek belajar koding</span>
        <span>Pendidikan Komputer FKIP ULM </span>
      </footer>
    </div>
  )
}