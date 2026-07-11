import { useEffect, useRef, useState } from 'react'
import { T, HERO, MARQUEE, ABOUT, EDUCATION, SKILLS, TIMELINE } from './data.js'
import { downloadResume } from './resume.js'
import { useBackground, useReveal } from './effects.js'
import { useManifest } from './manifest.js'
import Button from './components/Button.jsx'
import Marquee from './components/Marquee.jsx'
import SectionHeading from './components/SectionHeading.jsx'
import Tag from './components/Tag.jsx'
import ContactLink from './components/ContactLink.jsx'
import MediaSlot from './components/MediaSlot.jsx'
import { ArrowUpRight, ArrowDown, PlayIcon } from './components/Icons.jsx'

const STEP = 2

function initLang() {
  try {
    const s = localStorage.getItem('markus-lang')
    if (s === 'ru' || s === 'en') return s
  } catch {}
  const nav = ((typeof navigator !== 'undefined' && navigator.language) || 'en').toLowerCase()
  return nav.indexOf('ru') === 0 ? 'ru' : 'en'
}

// Ссылка с ховер-цветом (эквивалент style-hover="color:var(--accent)")
function HoverLink({ children, hoverColor = 'var(--accent)', baseColor, style, ...props }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...style, color: hover ? hoverColor : (baseColor ?? style?.color), transition: 'color var(--dur-fast) var(--ease-swift)' }}
    >
      {children}
    </a>
  )
}

const meta = {
  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 'var(--tracking-meta)',
  textTransform: 'uppercase', textDecoration: 'none',
}

export default function App() {
  const [lang, setLang] = useState(initLang)
  const [visible, setVisible] = useState(STEP)
  const sentinelRef = useRef(null)

  const { cases: ALL_CASES, hero: heroMedia } = useManifest()

  const t = T[lang]
  const isRu = lang === 'ru'
  const total = ALL_CASES.length
  const vis = Math.min(visible, total)
  const hasMore = vis < total

  const setLangPersist = (l) => {
    try { localStorage.setItem('markus-lang', l) } catch {}
    setLang(l)
  }

  useBackground()
  useReveal([lang, vis, total])

  // Ленивая подгрузка кейсов при приближении к sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((ents) => {
      if (ents[0].isIntersecting) setVisible((v) => Math.min(v + STEP, total))
    }, { rootMargin: '500px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [total])

  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v)
  const cases = ALL_CASES.slice(0, vis).map((c, i) => ({
    no: String(i + 1).padStart(2, '0'),
    id: c.id, year: c.year,
    title: pick(c.title), role: pick(c.role),
    goal: pick(c.goal), desc: pick(c.desc), result: pick(c.result),
    tags: pick(c.tags) || [],
    media: c.media || {},
  }))

  return (
    <div id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <canvas id="ds-bg" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* ===== NAV ===== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px var(--container-pad)', background: 'rgba(12,12,13,.72)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line-1)',
      }}>
        <a href="#top" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--fg-1)', textDecoration: 'none' }}>
          ALEKSEY VTORYGIN
        </a>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <HoverLink href="#about" style={{ ...meta, color: 'var(--fg-2)' }}>{t.navAbout}</HoverLink>
          <HoverLink href="#timeline" style={{ ...meta, color: 'var(--fg-2)' }}>{t.navTimeline}</HoverLink>
          <HoverLink href="#work" style={{ ...meta, color: 'var(--fg-2)' }}>{t.navWork}</HoverLink>
          <HoverLink href="#contact" style={{ ...meta, color: 'var(--fg-2)' }}>{t.navContact}</HoverLink>
          <span style={{ width: 1, height: 16, background: 'var(--line-2)' }} />
          <span className="nav-lang" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...meta }}>
            <span onClick={() => setLangPersist('ru')} style={{ cursor: 'pointer', color: isRu ? 'var(--accent)' : 'var(--fg-3)' }}>RU</span>
            <span style={{ color: 'var(--fg-3)' }}>/</span>
            <span onClick={() => setLangPersist('en')} style={{ cursor: 'pointer', color: !isRu ? 'var(--accent)' : 'var(--fg-3)' }}>EN</span>
          </span>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-grid" style={{
        position: 'relative', zIndex: 1, minHeight: '92vh', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
        gap: 'var(--space-8)', alignItems: 'center', padding: 'var(--space-9) var(--container-pad) var(--space-8)',
        maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%',
      }}>
        <div data-sy="0.22" data-mx="0" style={{
          position: 'absolute', left: '2%', top: '8%', zIndex: 0, fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'min(34vw,440px)', lineHeight: 0.8, color: 'rgba(255,255,255,.025)', letterSpacing: '-.04em',
          pointerEvents: 'none', userSelect: 'none',
        }}>AV</div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
          <span data-mx="14" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...meta, color: 'var(--fg-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: 'var(--glow-sm)' }} />
            {HERO[lang].eyebrow}
          </span>
          <h1 data-mx="26" className="hero-title" style={{ fontSize: 'var(--text-hero)', lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)', textTransform: 'uppercase', margin: 0, overflowWrap: 'break-word' }}>
            <span style={{ color: 'var(--fg-1)' }}>{HERO[lang].title1}</span><br />
            <span style={{ color: 'var(--accent)', textShadow: 'var(--glow-text)' }}>{HERO[lang].title2}</span>
          </h1>
          <p data-mx="10" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-body)', color: 'var(--fg-2)', maxWidth: 560, margin: 'var(--space-2) 0 0' }}>
            <span style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{HERO[lang].greeting}</span> {HERO[lang].sub}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-5) var(--space-7)', marginTop: 'var(--space-4)' }}>
            <HoverLink href="https://t.me/arhidis1" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10, ...meta, fontSize: 13, color: 'var(--fg-1)' }}>
              <span style={{ color: 'var(--fg-3)' }}>{t.tgLabel}</span>@ARHIDIS1<ArrowUpRight size={13} style={{ marginLeft: 2 }} />
            </HoverLink>
            <HoverLink href="tel:+79508679985" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10, ...meta, fontSize: 13, color: 'var(--fg-1)' }}>
              <span style={{ color: 'var(--fg-3)' }}>{t.phoneLabel}</span>+7 950 867-99-85<ArrowUpRight size={13} style={{ marginLeft: 2 }} />
            </HoverLink>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="accent" size="lg" onClick={() => downloadResume(lang)}>{t.resume} <ArrowDown size={14} /></Button>
          </div>
        </div>

        <div className="hero-media" style={{ position: 'relative', zIndex: 2, justifySelf: 'end', width: '100%', maxWidth: 440 }}>
          <div data-mx="-30" style={{ position: 'absolute', inset: '-18px -18px auto auto', width: '100%', height: '100%', border: '1px solid rgba(255,106,26,.4)', zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', aspectRatio: '4/5', border: '1px solid var(--line-2)', overflow: 'hidden', background: 'var(--bg-2)', boxShadow: 'var(--glow-md)' }}>
            <MediaSlot media={heroMedia && heroMedia.photo} placeholder={HERO[lang].photoPh} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, padding: '14px 16px', pointerEvents: 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--fg-1)', background: 'rgba(10,10,11,.55)', backdropFilter: 'blur(6px)', padding: '5px 10px', border: '1px solid var(--line-2)' }}>ALEKSEY VTORYGIN</span>
            </div>
          </div>
        </div>

        <HoverLink href="#work" style={{ position: 'absolute', left: 'var(--container-pad)', bottom: 'var(--space-6)', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 10, ...meta, fontSize: 11, color: 'var(--fg-3)' }}>
          {t.scroll} <ArrowDown size={12} />
        </HoverLink>
      </section>

      {/* ===== MARQUEE ===== */}
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg-0)' }}>
        <Marquee items={MARQUEE[lang]} size={22} />
      </div>

      {/* ===== WORK ===== */}
      <section id="work" style={{ order: 4, position: 'relative', zIndex: 1, background: 'var(--bg-0)', padding: 'var(--space-9) 0' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index="04" label={t.workLabel} title={t.workTitle} count={isRu ? `${total} проектов` : `${total} projects`} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            {cases.map((c) => (
              <article key={c.id} data-reveal className="case-grid" style={{
                opacity: 0, transform: 'translateY(42px)', transition: 'opacity .9s var(--ease-expo), transform .9s var(--ease-expo)',
                display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'var(--space-8)', alignItems: 'start',
                padding: 'var(--space-8) 0', borderTop: '1px solid var(--line-1)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', border: '1px solid var(--line-1)', overflow: 'hidden', background: 'var(--bg-2)' }}>
                    <MediaSlot media={c.media.m0} placeholder={t.vphV} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(10,10,11,.6)', backdropFilter: 'blur(6px)', padding: '5px 10px', border: '1px solid var(--line-2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: 'var(--glow-sm)' }} />{t.videoBadge}
                      </span>
                      <span style={{ color: 'var(--accent-ink)', background: 'var(--accent)', width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 3, boxShadow: 'var(--glow-md)' }}><PlayIcon size={18} /></span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                    {['m1', 'm2', 'm3'].map((m) => (
                      <div key={m} style={{ position: 'relative', aspectRatio: '1/1', border: '1px solid var(--line-1)', overflow: 'hidden', background: 'var(--bg-2)' }}>
                        <MediaSlot media={c.media[m]} placeholder={t.vphP} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <span className="case-no" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 0.9, color: 'var(--accent)', textShadow: 'var(--glow-text)' }}>{c.no}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-tight)', textTransform: 'uppercase', margin: 0 }}>{c.title}</h3>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{c.role} · {c.year}</span>
                    </div>
                  </div>
                  <Field label={t.goalLabel} labelColor="var(--accent)" value={c.goal} valueColor="var(--fg-1)" fontSize={16} />
                  <Field label={t.descLabel} value={c.desc} valueColor="var(--fg-2)" fontSize={15} />
                  <Field label={t.resultLabel} value={c.result} valueColor="var(--fg-1)" fontSize={15} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    {c.tags.map((tag) => (
                      <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--line-1)', color: 'var(--fg-2)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-7) 0 0', borderTop: '1px solid var(--line-1)', marginTop: 'var(--space-4)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t.loading}</span>
              <Button variant="outline" onClick={() => setVisible((v) => Math.min(v + STEP, total))}>{t.loadMore} +</Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" style={{ order: 1, position: 'relative', zIndex: 1, background: 'var(--bg-1)', padding: 'var(--space-9) 0' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index="01" label={t.aboutLabel} title={t.aboutTitle} />
          <div data-reveal className="about-grid" style={{ opacity: 0, transform: 'translateY(42px)', transition: 'opacity .9s var(--ease-expo), transform .9s var(--ease-expo)', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 'var(--space-8)', marginTop: 'var(--space-7)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {ABOUT[lang].map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 'var(--text-md)', lineHeight: 'var(--leading-body)', color: 'var(--fg-2)' }}>{p}</p>
              ))}
            </div>
            <div className="about-aside" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderLeft: '1px solid var(--line-1)', paddingLeft: 'var(--space-6)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--accent)' }}>{t.eduTitle}</span>
              {EDUCATION[lang].map((e, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--line-1)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{e.year}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.4, color: 'var(--fg-1)' }}>{e.line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" style={{ order: 2, position: 'relative', zIndex: 1, background: 'var(--bg-0)', padding: 'var(--space-9) 0' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index="02" label={t.skillsLabel} title={t.skillsTitle} />
          <div data-reveal style={{ opacity: 0, transform: 'translateY(42px)', transition: 'opacity .9s var(--ease-expo), transform .9s var(--ease-expo)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-7)' }}>
            {SKILLS[lang].map((sk) => <Tag key={sk}>{sk}</Tag>)}
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section id="timeline" style={{ order: 3, position: 'relative', zIndex: 1, background: 'var(--bg-1)', padding: 'var(--space-9) 0' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index="03" label={t.tlLabel} title={t.tlTitle} />
          <div style={{ marginTop: 'var(--space-7)' }}>
            {TIMELINE[lang].map((tl, i) => (
              <div key={i} data-reveal className="timeline-row" style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity .8s var(--ease-expo), transform .8s var(--ease-expo)', display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: 'var(--space-5)', alignItems: 'baseline', padding: 'var(--space-4) 0', borderTop: '1px solid var(--line-1)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 'var(--tracking-meta)', color: 'var(--accent)' }}>{tl.year}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: 'var(--tracking-display)', color: 'var(--fg-1)' }}>{tl.role}</span>
                <span className="tl-org" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--fg-3)', textAlign: 'right' }}>{tl.org}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" style={{ order: 5, position: 'relative', zIndex: 1, background: 'var(--bg-0)', padding: 'var(--space-9) 0 var(--space-7)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index="05" label={t.contactLabel} title={t.contactTitle} />
          <div data-reveal style={{ opacity: 0, transform: 'translateY(42px)', transition: 'opacity .9s var(--ease-expo), transform .9s var(--ease-expo)', marginTop: 'var(--space-6)' }}>
            <ContactLink label="TELEGRAM" value="@ARHIDIS1" href="https://t.me/arhidis1" size={44} />
            <ContactLink label={t.phoneLabel} value="+7 950 867-99-85" href="tel:+79508679985" size={44} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
            <Button variant="accent" size="lg" onClick={() => downloadResume(lang)}>{t.resume} <ArrowDown size={14} /></Button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t.footer}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, labelColor = 'var(--fg-3)', value, valueColor, fontSize }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase', color: labelColor }}>{label}</span>
      <p style={{ margin: 0, color: valueColor, fontSize, lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}
