import { useLayoutEffect, useRef, useState } from 'react'

/* Carta de item: CSS embutido, injetado uma vez.
   Card = frente, CardBack = verso, CardFlip = giro no clique.
   Cores: white | black | green | blue | gold | red */

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap");

.tcg-fit { position:relative; width:100%; height:100%; aspect-ratio:5 / 7; overflow:hidden;
  -webkit-text-size-adjust:none; text-size-adjust:none; }
.tcg-scale { position:absolute; top:0; left:0; width:512px; height:716.8px; transform-origin:top left; }
.tcg {
  width: 100%;
  height: 100%;
  font-size: 16px;
  -webkit-text-size-adjust:none; text-size-adjust:none;
  font-family: "Crimson Pro", Georgia, serif;
  user-select: none; position: relative;

  --m1:#f3dc9a; --m2:#c79a3d; --m3:#7a5517;
  --bg1:#2e2514; --bg2:#15110a;
  --fg:#f3dc9a; --fg2:#c79a3d;
  --gem:#ffc83d;
  --paper:#dac79b; --paper-ink:#2a2016;
  --stat1:#2a241a; --stat2:#0f0d09;

  --noise:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  --grunge:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='4' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -.35'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
}

.tcg--white { --m1:#fbf8ef; --m2:#c2bba7; --m3:#6e695a; --bg1:#efeadb; --bg2:#d3cbb4;
  --fg:#2b2820; --fg2:#6e695a; --gem:#8fa3b8; --paper:#fffdf6; --paper-ink:#2b2820; --stat1:#f6f2e6; --stat2:#d8d0ba; }
.tcg--black { --m1:#dfe3ea; --m2:#8e95a3; --m3:#464b57; --bg1:#2a2b31; --bg2:#141518;
  --fg:#e3e6ec; --fg2:#9aa1af; --gem:#a77bff; --paper:#c9c3b6; --stat1:#2c2d34; --stat2:#121317; }
.tcg--green { --m1:#d9efae; --m2:#7da64a; --m3:#33521f; --bg1:#17382a; --bg2:#0a1a13;
  --fg:#d9efae; --fg2:#8fb85d; --gem:#58ffa4; --paper:#d3d7a8; --stat1:#1c3d2d; --stat2:#09180f; }
.tcg--blue  { --m1:#cfe4ff; --m2:#6794d6; --m3:#27497f; --bg1:#16294a; --bg2:#08111f;
  --fg:#cfe4ff; --fg2:#7ea6de; --gem:#4fc3ff; --paper:#cfd6dc; --stat1:#1a2f55; --stat2:#08101d; }
.tcg--red   { --m1:#ffd3c2; --m2:#c9594a; --m3:#6f211b; --bg1:#411a1d; --bg2:#1a0a0c;
  --fg:#ffd3c2; --fg2:#d4806f; --gem:#ff5555; --paper:#dcc3a6; --stat1:#4a1d20; --stat2:#180809; }

.tcg__face, .tcg__frame { position: relative; }
.tcg__frame {
  height: 100%; box-sizing: border-box; padding: 1.4em 1.6em; border-radius: 1.6em;
  color: var(--fg);
  background: var(--noise), radial-gradient(120% 90% at 50% 0%, var(--bg1) 0%, var(--bg2) 75%);
  background-blend-mode: soft-light, normal;
  border: .7em solid transparent;
  border-image: linear-gradient(135deg,var(--m1),var(--m3) 35%,var(--m2) 55%,var(--m1) 80%,var(--m3)) 1;
  box-shadow: inset 0 0 0 .15em var(--m3), inset 0 0 0 .3em rgba(0,0,0,.55), inset 0 0 4em rgba(0,0,0,.55);
  clip-path: polygon(1.4em 0,calc(100% - 1.4em) 0,100% 1.4em,100% calc(100% - 1.4em),calc(100% - 1.4em) 100%,1.4em 100%,0 calc(100% - 1.4em),0 1.4em);
}
.tcg__frame::after { content:""; position:absolute; inset:0; pointer-events:none;
  background: var(--grunge); mix-blend-mode: multiply; opacity:.3; }
.tcg { filter: drop-shadow(0 1em 1.6em rgba(0,0,0,.5)); }

.tcg__corner { position:absolute; width:3.4em; height:3.4em; color:var(--m2); z-index:3; }
.tcg__corner.tl{top:-.3em;left:-.3em} .tcg__corner.tr{top:-.3em;right:-.3em;transform:scaleX(-1)}
.tcg__corner.bl{bottom:-.3em;left:-.3em;transform:scaleY(-1)} .tcg__corner.br{bottom:-.3em;right:-.3em;transform:scale(-1,-1)}

.tcg__front { display:grid; height:100%; min-height:0; grid-template-rows:auto minmax(0,1fr) auto auto auto; gap:.8em; }
.tcg__title { margin:0 1.4em; padding:.3em .8em; text-align:center;
  border-top:.1em solid var(--m3); border-bottom:.1em solid var(--m3);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent); }
.tcg__title h3 { margin:0; font:800 1.5em/1.2 "Cinzel",Georgia,serif; letter-spacing:.04em; color:var(--fg);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tcg__art { position:relative; min-height:0; overflow:hidden; display:grid; place-items:center;
  border-radius:9em 9em .6em .6em / 6em 6em .6em .6em; border:.2em solid var(--m2);
  box-shadow:0 0 0 .2em #000, 0 0 0 .3em var(--m3), inset 0 0 1.8em rgba(0,0,0,.8);
  background:radial-gradient(circle at 50% 40%, var(--bg1), #050505); color:var(--m2); }
.tcg__art img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  object-position:var(--ix, 50%) var(--iy, 50%); transform:scale(var(--iz, 1));
  transform-origin:var(--ix, 50%) var(--iy, 50%); display:block; }
.tcg__art svg { width:42%; height:auto; }
.tcg__meta { display:flex; align-items:center; justify-content:center; gap:1em; min-width:0; max-width:100%;
  font:600 1.1em/1 "Cinzel",Georgia,serif; letter-spacing:.06em; color:var(--fg); text-align:center; }
.tcg__meta span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tcg__gem { width:.7em; height:.7em; flex:0 0 auto; transform:rotate(45deg); background:var(--gem); box-shadow:0 0 .8em var(--gem); }
.tcg__text { padding:.8em 1em; min-height:8.4em; border-radius:.4em; border:.15em solid var(--m3);
  color:var(--paper-ink); background:var(--grunge), var(--noise), var(--paper); background-blend-mode:multiply,multiply,normal;
  box-shadow:inset 0 0 1.4em rgba(70,45,10,.5); }
.tcg__text p { margin:0; font-size:1.3em; line-height:1.25; }
.tcg__stats { display:flex; gap:.4em; padding-top:.2em; }
.tcg__stat { flex:1; display:grid; place-items:center; padding:.35em 0 .25em; border-radius:.8em;
  border:.15em solid var(--m2); background:linear-gradient(180deg,var(--stat1),var(--stat2));
  box-shadow:inset 0 0 .6em #000, 0 .1em 0 var(--m3); }
.tcg__stat b { font:800 1.55em/1 "Cinzel",Georgia,serif; color:var(--fg); }
.tcg__stat small { font:600 .85em/1 "Cinzel",Georgia,serif; letter-spacing:.08em; color:var(--fg2); }

.tcg__back { display:grid; grid-template-rows:1fr auto; gap:.8em; }
.tcg__backart { position:relative; min-height:0; overflow:hidden; border-radius:.8em; border:.2em solid var(--m2);
  box-shadow:0 0 0 .2em #000, 0 0 0 .3em var(--m3), inset 0 0 2em rgba(0,0,0,.8);
  background:radial-gradient(circle at 50% 45%, var(--bg1), #050505); display:grid; place-items:center; }
.tcg__backart img { width:100%; height:100%; object-fit:cover; display:block; }
.tcg__backart svg { width:55%; color:var(--m2); opacity:.9; }
.tcg__backtext { text-align:center; font:800 1.4em/1 "Cinzel",Georgia,serif; letter-spacing:.1em; color:var(--fg); padding:.2em 0; }

.tcg-flip { width:100%; aspect-ratio:5/7; perspective:1400px; cursor:pointer; container-type:inline-size; }
.tcg-locked { width:100%; height:100%; opacity:.2; pointer-events:none; container-type:inline-size; }
.tcg-locked > .tcg-fit { width:100%; height:100%; aspect-ratio:auto; }
.tcg-flip__in { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform .7s cubic-bezier(.3,.7,.2,1); }
.tcg-flip.is-back .tcg-flip__in { transform:rotateY(180deg); }
.tcg-flip .tcg-fit { position:absolute; inset:0; width:100%; height:100%; aspect-ratio:auto;
  backface-visibility:hidden; -webkit-backface-visibility:hidden; }
.tcg-flip .tcg-fit--rev { transform:rotateY(180deg); }
@media (prefers-reduced-motion: reduce){ .tcg-flip__in{ transition:none } }
`

function useStyles() {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector('style[data-tcg]')
  if (!el) {
    el = document.createElement('style')
    el.setAttribute('data-tcg', '')
    document.head.appendChild(el)
  }
  if (el.textContent !== CSS) el.textContent = CSS
}

function Corner({ pos }) {
  return (
    <svg className={`tcg__corner ${pos}`} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M2 38V10Q2 2 10 2H38" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 38V14Q8 8 14 8H38" fill="none" stroke="currentColor" strokeWidth="1" opacity=".7" />
      <path d="M2 2L14 2L2 14Z" fill="currentColor" />
      <circle cx="16" cy="16" r="2.5" fill="var(--gem)" />
    </svg>
  )
}

function Corners() {
  return ['tl', 'tr', 'bl', 'br'].map((pos) => <Corner key={pos} pos={pos} />)
}

const CARD_WIDTH = 512

function FaceShell({ rev = false, className = '', children }) {
  const ref = useRef(null)
  const [zoom, setZoom] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const apply = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      if (width <= 0) return
      const byWidth = width / CARD_WIDTH
      const byHeight = height > 0 ? height / (CARD_WIDTH * 1.4) : byWidth
      setZoom(Math.min(byWidth, byHeight))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`tcg-fit ${rev ? 'tcg-fit--rev' : ''} ${className}`}>
      <div className="tcg-scale" style={{ transform: `scale(${zoom})` }}>
        {children}
      </div>
    </div>
  )
}

function artStyle(frame) {
  const zoom = frame?.zoom ?? 1
  const x = frame?.x ?? 50
  const y = frame?.y ?? 50
  return { '--ix': `${x}%`, '--iy': `${y}%`, '--iz': zoom }
}

export function Card({
  title,
  image,
  imageFrame,
  fallback = null,
  type,
  origin,
  description,
  stats = [],
  color = 'gold',
  className = '',
  rev = false,
}) {
  useStyles()
  const shown = stats.slice(0, 5)
  const text = typeof description === 'string' ? description.trim() : description

  return (
    <FaceShell rev={rev} className={className}>
      <article className={`tcg tcg--${color}`}>
      <div className="tcg__frame tcg__front">
        <Corners />
        <header className="tcg__title">
          <h3>{title}</h3>
        </header>
        <div className="tcg__art">
          {image ? <img src={image} alt="" draggable="false" style={artStyle(imageFrame)} /> : fallback}
        </div>
        <div className="tcg__meta">
          <span>{type}</span>
          {origin ? (
            <>
              <i className="tcg__gem" />
              <span>{origin}</span>
            </>
          ) : null}
        </div>
        {text ? (
          <section className="tcg__text">
            <p>{text}</p>
          </section>
        ) : null}
        {shown.length ? (
          <footer className="tcg__stats">
            {shown.map((stat) => (
              <div className="tcg__stat" key={stat.label}>
                <b>{stat.value}</b>
                <small>{stat.label}</small>
              </div>
            ))}
          </footer>
        ) : null}
      </div>
      </article>
    </FaceShell>
  )
}

export function CardBack({ backImage, text = '', color = 'gold', className = '', rev = false }) {
  useStyles()
  return (
    <FaceShell rev={rev} className={className}>
      <article className={`tcg tcg--${color}`}>
      <div className="tcg__frame tcg__back">
        <Corners />
        <div className="tcg__backart">
          {backImage ? (
            <img src={backImage} alt="" draggable="false" />
          ) : (
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M50 8 L62 38 L92 50 L62 62 L50 92 L38 62 L8 50 L38 38 Z" />
              <circle cx="50" cy="50" r="12" />
              <circle cx="50" cy="50" r="30" strokeDasharray="3 4" />
            </svg>
          )}
        </div>
        {text ? <div className="tcg__backtext">{text}</div> : null}
      </div>
      </article>
    </FaceShell>
  )
}

export function CardFlip({ backImage, backText, backColor, ...front }) {
  useStyles()
  const [back, setBack] = useState(false)

  function turn() {
    setBack((current) => !current)
  }

  return (
    <div
      className={`tcg-flip ${back ? 'is-back' : ''}`}
      onClick={turn}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          turn()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={back ? `Verso de ${front.title}` : `Virar ${front.title}`}
    >
      <div className="tcg-flip__in">
        <Card {...front} />
        <CardBack rev backImage={backImage} text={backText} color={backColor || front.color} />
      </div>
    </div>
  )
}
