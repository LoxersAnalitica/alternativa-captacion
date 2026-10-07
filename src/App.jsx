import { useState, useEffect } from 'react'
import CookieConsent from 'react-cookie-consent'
import 'react-phone-number-input/style.css'
import './index.css'
import ValuationWizard from './Wizard.jsx'

const ZONES = [
  { name: 'Fuengirola', desc: 'Primera línea, Los Boliches, Torreblanca y centro.' },
  { name: 'Benalmádena', desc: 'Benalmádena Costa, Pueblo, Arroyo de la Miel y Torrequebrada.' },
  { name: 'Mijas', desc: 'Mijas Pueblo, Mijas Costa, La Cala y Calahonda.' },
  { name: 'Riviera del Sol', desc: 'Urbanizaciones con vistas al mar y al golf, entre Mijas y Marbella.' },
]

const ERRORS = [
  {
    n: '01', label: 'Error 01',
    title: 'Pones el precio que quieres, no el que el mercado acepta.',
    text: 'Si el precio de salida está mal, tu vivienda se queda sin visitas. Y cuanto más tiempo pasa, peor se percibe. El precio no es lo que necesitas: es lo que el mercado está dispuesto a pagar hoy.',
  },
  {
    n: '02', label: 'Error 02',
    title: 'Recibes llamadas de cualquiera, sin filtrar.',
    text: 'Curiosos, personas sin financiación, turistas de fin de semana… Tu tiempo vale, y no todas las visitas son oportunidades reales. Sin filtro previo, solo acumulas desgaste.',
  },
  {
    n: '03', label: 'Error 03',
    title: 'Vendes sin estrategia ni negociación profesional.',
    text: 'Fotos improvisadas, un anuncio más entre miles y una negociación a la defensiva. El resultado: meses perdidos y miles de euros que se quedan sobre la mesa.',
  },
]

const STEPS = [
  { n: '1', title: 'Rellena el formulario', text: 'Menos de 2 minutos. Solo los datos clave de tu vivienda.' },
  { n: '2', title: 'Analizamos tu vivienda', text: 'Comparamos con operaciones reales y la demanda actual en tu zona.' },
  { n: '3', title: 'Te llamamos con el precio real', text: 'Y una estrategia clara para vender al mejor precio, sin compromiso.' },
]

/* ─── Logo ─────────────────────────────────────────────── */
function Logo({ light = false }) {
  return (
    <a href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Alternativa Málaga Real Estate – inicio">
      <img src="/assets/logo-x.png" alt="" width="40" height="36" />
      <span className="brand-text">
        <span className="brand-name">Alternativa</span>
        <span className="brand-sub">Málaga · Real Estate</span>
      </span>
    </a>
  )
}

const scrollToForm = () => {
  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
}

/* ─── Header ───────────────────────────────────────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Logo />
        <button type="button" id="header-cta" className="btn btn-primary btn-sm" onClick={scrollToForm}>
          Valorar mi vivienda
        </button>
      </div>
    </header>
  )
}

/* ─── Hero ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <img src="/assets/hero-costa-del-sol.jpg" alt="Villa con piscina y vistas al mar en la Costa del Sol" className="hero-bg" fetchPriority="high" />
      <div className="hero-overlay" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-red">Propietarios · Costa del Sol</span>
          <h1 className="hero-title">
            ¿Cuánto vale <span className="u-red">hoy</span> tu vivienda en la Costa del Sol?
          </h1>
          <span className="red-bar" />
          <p className="hero-sub">
            Recibe una <strong>valoración profesional y gratuita</strong> basada en ventas reales en
            Fuengirola, Benalmádena, Mijas y Riviera del Sol. Sin curiosos, sin perder tiempo y sin compromiso.
          </p>
          <ul className="hero-zones" aria-label="Zonas de trabajo">
            {ZONES.map((z) => <li key={z.name}>{z.name}</li>)}
          </ul>
          <div className="hero-stats">
            <div><strong>+15</strong><span>años en el sector inmobiliario</span></div>
            <div><strong>4</strong><span>zonas especialistas en la Costa del Sol</span></div>
            <div><strong>0 €</strong><span>coste de la valoración</span></div>
          </div>
        </div>
        <div className="hero-form">
          <ValuationWizard />
        </div>
      </div>
    </section>
  )
}

/* ─── Errores (estilo de sus publicaciones) ────────────── */
function Errors() {
  return (
    <section className="section errors" aria-labelledby="errors-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-red">Propietarios</span>
          <h2 id="errors-title" className="section-title">Vender solo parece fácil.<br />Hasta que no lo es.</h2>
          <p className="section-lead">Estos son los 3 errores que más dinero cuestan a los propietarios de la Costa del Sol.</p>
        </div>
        <div className="errors-grid">
          {ERRORS.map((e) => (
            <article key={e.n} className="error-card">
              <span className="error-num">{e.n}</span>
              <span className="eyebrow eyebrow-red eyebrow-sm">{e.label}</span>
              <h3>{e.title}</h3>
              <span className="red-bar red-bar-sm" />
              <p>{e.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Cómo funciona ────────────────────────────────────── */
function HowItWorks() {
  return (
    <section className="section how" aria-labelledby="how-title">
      <img src="/assets/logo-x.png" alt="" className="how-x" aria-hidden="true" />
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-red">Cómo funciona</span>
          <h2 id="how-title" className="section-title light">Tu valoración en 3 pasos</h2>
        </div>
        <div className="how-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="how-card">
              <span className="how-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <div className="center">
          <button type="button" id="how-cta" className="btn btn-primary btn-lg" onClick={scrollToForm}>Empezar mi valoración gratuita</button>
        </div>
      </div>
    </section>
  )
}

/* ─── Zonas ────────────────────────────────────────────── */
function Zones() {
  return (
    <section className="section zones" aria-labelledby="zones-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-red">Dónde trabajamos</span>
          <h2 id="zones-title" className="section-title">Especialistas en tu zona</h2>
          <p className="section-lead">Conocemos cada calle, cada urbanización y qué está pagando realmente el comprador en cada una.</p>
        </div>
        <div className="zones-grid">
          {ZONES.map((z, i) => (
            <div key={z.name} className="zone-card">
              <span className="zone-idx">0{i + 1}</span>
              <h3>{z.name}</h3>
              <p>{z.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Gustavo Fernández ────────────────────────────────── */
function About() {
  return (
    <section className="section about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-photo">
          <div className="about-photo-frame">
            <img src="/assets/gustavo-fernandez.jpg" alt="Gustavo Fernández, CEO de Alternativa Málaga Real Estate" loading="lazy" width="512" height="512" />
          </div>
          <img src="/assets/logo-x.png" alt="" className="about-x" aria-hidden="true" />
          <div className="about-badge">
            <strong>Gustavo Fernández</strong>
            <span>CEO & Fundador</span>
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow eyebrow-red">Quién te asesora</span>
          <h2 id="about-title" className="section-title">No te diré el precio que quieres oír.<br /><span className="u-red">Te diré el que el mercado paga.</span></h2>
          <span className="red-bar" />
          <p>
            Soy <strong>Gustavo Fernández</strong>, economista y emprendedor inmobiliario desde 2009. Fundé mi primera
            agencia en Argentina y en 2022 traje ese método a la Costa del Sol con <strong>Alternativa Málaga Real Estate</strong>,
            una agencia creada para cambiar la forma de vender vivienda en la zona.
          </p>
          <p>
            Como cofundador de la promotora <strong>Fusión +34</strong>, conozco el mercado desde dentro: qué se construye,
            qué busca el comprador y cuánto paga de verdad en Fuengirola, Benalmádena, Mijas y Riviera del Sol.
          </p>
          <p>
            Sé que tu vivienda no es una operación más: es tu patrimonio. Por eso trabajamos con un equipo formado,
            tecnología y un trato cercano, para que vendas <strong>al mejor precio, en el menor tiempo y sin desgaste</strong>.
          </p>
          <ul className="about-list">
            <li>Graduado en Ciencias Económicas y Empresariales</li>
            <li>Más de 15 años dirigiendo inmobiliarias en dos países</li>
            <li>Cofundador de Fusión +34, promotora residencial</li>
            <li>Equipo local que acompaño personalmente en cada venta</li>
          </ul>
          <blockquote className="about-quote">“Las personas son lo más importante. Y tu vivienda, también.”</blockquote>
          <button type="button" id="about-cta" className="btn btn-primary btn-lg" onClick={scrollToForm}>Quiero saber cuánto vale mi vivienda</button>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA final ────────────────────────────────────────── */
function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container final-inner">
        <div>
          <span className="eyebrow eyebrow-red">Valoración gratuita</span>
          <h2>Descubre en 2 minutos lo que el mercado pagaría hoy por tu vivienda.</h2>
        </div>
        <button type="button" id="final-cta" className="btn btn-white btn-lg" onClick={scrollToForm}>Valorar mi vivienda</button>
      </div>
    </section>
  )
}

/* ─── Footer ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo light />
        <p>Alternativa Málaga Real Estate · Fuengirola · Benalmádena · Mijas · Riviera del Sol</p>
        <a href="/politica-de-privacidad" className="footer-link">Política de privacidad</a>
      </div>
    </footer>
  )
}

/* ─── Política de privacidad ───────────────────────────── */
function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <section className="privacy">
      <div className="container privacy-inner">
        <h1>Política de privacidad</h1>
        <p>En <strong>Alternativa Málaga Real Estate</strong> la protección de tus datos es fundamental. Esta política describe cómo recopilamos, utilizamos y protegemos la información personal que nos facilitas a través de este formulario de valoración.</p>
        <h3>1. Datos que recopilamos</h3>
        <p>Nombre, teléfono, email y los datos de la vivienda que nos indicas (ubicación, características y precio estimado), estrictamente necesarios para elaborar la valoración y contactar contigo.</p>
        <h3>2. Finalidad</h3>
        <ul>
          <li>Elaborar una valoración de mercado de tu vivienda.</li>
          <li>Contactarte por teléfono, email o WhatsApp para entregarte la valoración.</li>
          <li>Gestionar, si así lo deseas, la comercialización de tu vivienda.</li>
        </ul>
        <h3>3. Conservación y derechos</h3>
        <p>Conservaremos tus datos mientras exista una relación comercial o hasta que solicites su supresión. Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad contactando con Alternativa Málaga Real Estate.</p>
        <p className="muted">Última actualización: octubre de 2026.</p>
        <a href="/" className="back-link">← Volver al inicio</a>
      </div>
    </section>
  )
}

/* ─── App ──────────────────────────────────────────────── */
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (currentPath === '/politica-de-privacidad') {
    return (
      <>
        <Header />
        <main><PrivacyPolicy /></main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="Entendido"
        cookieName="alternativa-cookie-consent"
        disableStyles
        containerClasses="cookie-bar"
        buttonClasses="btn btn-primary btn-sm"
        contentClasses="cookie-text"
        expires={150}
      >
        Utilizamos cookies para mejorar tu experiencia, mostrarte contenido personalizado y analizar nuestro tráfico. Al hacer clic en “Entendido”, aceptas su uso.
      </CookieConsent>
      <Header />
      <main>
        <Hero />
        <Errors />
        <HowItWorks />
        <Zones />
        <About />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
