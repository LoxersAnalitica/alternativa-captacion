import { useState, useMemo } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

const MUNICIPALITIES = ['Fuengirola', 'Benalmádena', 'Mijas', 'Riviera del Sol'];
const PROPERTY_TYPES = ['Piso / Apartamento', 'Ático', 'Adosado', 'Villa / Chalet', 'Dúplex', 'Estudio'];
const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6+'];
const BATH_OPTIONS = ['1', '2', '3', '4', '5+'];
const CONDITIONS = ['A reformar', 'Buen estado', 'Reformado / Nuevo'];
const FEATURES = ['Piscina', 'Terraza', 'Jardín', 'Garaje', 'Trastero', 'Ascensor', 'Aire acondicionado', 'Urbanización cerrada'];
const VIEWS = ['Al mar', 'Montaña', 'Golf', 'Despejadas', 'Sin vistas'];
const PRICE_HINTS = [200000, 300000, 450000, 600000, 800000, 1000000];

const TOTAL_STEPS = 5;
const STEP_TITLES = {
  1: '¿Dónde está tu vivienda?',
  2: 'Habitaciones y baños',
  3: 'Cuéntanos un poco más',
  4: '¿Cuánto crees que debe valer tu vivienda?',
  5: '¿A quién enviamos la valoración?',
};

const formatThousands = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 9);
  return digits ? new Intl.NumberFormat('es-ES').format(Number(digits)) : '';
};

const getCookie = (name) => {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
};

const getTracking = () => {
  const p = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  return keys.reduce((acc, k) => { if (p.get(k)) acc[k] = p.get(k); return acc; }, {});
};

export default function ValuationWizard() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    municipality: '', propertyType: '', address: '',
    rooms: '', bathrooms: '',
    surface: '', condition: '', features: [], views: [],
    ownerPrice: '',
    name: '', phone: '', email: '', privacy: false,
  });

  const tracking = useMemo(getTracking, []);

  const set = (key, value) => { setError(''); setFormData((f) => ({ ...f, [key]: value })); };
  const toggle = (key, value) => {
    setError('');
    setFormData((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  /* ─── Validación por paso: no se avanza sin completar ─── */
  const validate = (s) => {
    if (s === 1) {
      if (!formData.municipality) return 'Selecciona el municipio de tu vivienda.';
      if (!formData.propertyType) return 'Selecciona el tipo de vivienda.';
      if (formData.address.trim().length < 5) return 'Indica la dirección o urbanización.';
    }
    if (s === 2) {
      if (!formData.rooms && !formData.bathrooms) return 'Selecciona cuántas habitaciones y baños tiene tu vivienda.';
      if (!formData.rooms) return 'Selecciona el número de habitaciones.';
      if (!formData.bathrooms) return 'Selecciona el número de baños.';
    }
    if (s === 3) {
      if (!formData.surface || Number(formData.surface) < 15) return 'Indica la superficie aproximada en m².';
      if (!formData.condition) return 'Selecciona el estado de la vivienda.';
    }
    if (s === 4) {
      const n = Number(String(formData.ownerPrice).replace(/\D/g, ''));
      if (!n || n < 20000) return 'Indica cuánto crees que vale tu vivienda (en euros).';
    }
    if (s === 5) {
      if (formData.name.trim().length < 2) return 'Introduce tu nombre.';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Introduce un email válido.';
      if (!formData.phone || !isValidPhoneNumber(formData.phone)) return 'Introduce un teléfono válido.';
      if (!formData.privacy) return 'Debes aceptar la política de privacidad.';
    }
    return '';
  };

  const next = () => {
    const msg = validate(step);
    if (msg) { setError(msg); return; }
    setError('');
    setStep((s) => s + 1);
  };
  const back = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) { next(); return; }
    const msg = validate(5);
    if (msg) { setError(msg); return; }

    setStatus('submitting');
    const eventId = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
    try {
      const resp = await fetch('/api/kommo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerPrice: String(formData.ownerPrice).replace(/\D/g, ''),
          tracking, eventId,
          fbp: getCookie('_fbp'), fbc: getCookie('_fbc'),
        }),
      });
      if (resp.ok) {
        setStatus('success');
        // Evento "Cliente potencial" en Meta al recibir la valoración
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: 'Valoración vivienda',
            content_category: formData.municipality,
            value: Number(String(formData.ownerPrice).replace(/\D/g, '')) || 0,
            currency: 'EUR',
          }, { eventID: eventId });
        }
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="wizard-card wizard-success" role="status">
        <div className="success-icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h3>¡Solicitud recibida, {formData.name.split(' ')[0]}!</h3>
        <p>Nuestro equipo en la Costa del Sol ya está analizando tu vivienda en <strong>{formData.municipality}</strong>.</p>
        <p>Te llamaremos en las próximas horas para contrastar los datos y entregarte una <strong>valoración real de mercado</strong>, sin compromiso.</p>
      </div>
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="wizard-card" id="valoracion">
      <div className="wizard-head">
        <div className="wizard-step-meta">
          <span className="wizard-kicker">Valoración gratuita</span>
          <span className="wizard-count">Paso {step} de {TOTAL_STEPS}</span>
        </div>
        <div className="wizard-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <h2 className="wizard-title">{STEP_TITLES[step]}</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="wizard-body">
        <div key={step} className="wizard-step">
          {step === 1 && (
            <>
              <label className="field-label">Municipio</label>
              <div className="chip-grid cols-2">
                {MUNICIPALITIES.map((m) => (
                  <button type="button" id={`muni-${m.replace(/\s/g, '-').toLowerCase()}`} key={m}
                    className={`chip ${formData.municipality === m ? 'is-active' : ''}`}
                    aria-pressed={formData.municipality === m}
                    onClick={() => set('municipality', m)}>{m}</button>
                ))}
              </div>

              <label className="field-label">Tipo de vivienda</label>
              <div className="chip-grid cols-3">
                {PROPERTY_TYPES.map((t) => (
                  <button type="button" key={t}
                    className={`chip chip-sm ${formData.propertyType === t ? 'is-active' : ''}`}
                    aria-pressed={formData.propertyType === t}
                    onClick={() => set('propertyType', t)}>{t}</button>
                ))}
              </div>

              <label className="field-label" htmlFor="address">Dirección o urbanización</label>
              <input id="address" className="field-input" type="text" autoComplete="street-address"
                placeholder="Ej: Calle Málaga 12, Los Boliches"
                value={formData.address} onChange={(e) => set('address', e.target.value)} />
            </>
          )}

          {step === 2 && (
            <>
              <p className="step-intro">Selecciona cuántas habitaciones y baños tiene tu vivienda. Es imprescindible para calcular su valor.</p>
              <label className="field-label">Habitaciones <span className="req">*</span></label>
              <div className="num-grid">
                {ROOM_OPTIONS.map((v) => (
                  <button type="button" key={v} id={`rooms-${v}`}
                    className={`num-btn ${formData.rooms === v ? 'is-active' : ''}`}
                    aria-pressed={formData.rooms === v}
                    onClick={() => set('rooms', v)}>{v}</button>
                ))}
              </div>
              <label className="field-label">Baños <span className="req">*</span></label>
              <div className="num-grid">
                {BATH_OPTIONS.map((v) => (
                  <button type="button" key={v} id={`baths-${v}`}
                    className={`num-btn ${formData.bathrooms === v ? 'is-active' : ''}`}
                    aria-pressed={formData.bathrooms === v}
                    onClick={() => set('bathrooms', v)}>{v}</button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label className="field-label" htmlFor="surface">Superficie construida (m²)</label>
              <input id="surface" className="field-input" type="number" inputMode="numeric" min="15"
                placeholder="Ej: 95" value={formData.surface} onChange={(e) => set('surface', e.target.value)} />

              <label className="field-label">Estado</label>
              <div className="chip-grid cols-3">
                {CONDITIONS.map((c) => (
                  <button type="button" key={c}
                    className={`chip chip-sm ${formData.condition === c ? 'is-active' : ''}`}
                    aria-pressed={formData.condition === c}
                    onClick={() => set('condition', c)}>{c}</button>
                ))}
              </div>

              <label className="field-label">Extras <span className="opt">(opcional)</span></label>
              <div className="tag-wrap">
                {FEATURES.map((t) => (
                  <button type="button" key={t}
                    className={`tag ${formData.features.includes(t) ? 'is-active' : ''}`}
                    aria-pressed={formData.features.includes(t)}
                    onClick={() => toggle('features', t)}>{t}</button>
                ))}
              </div>

              <label className="field-label">Vistas <span className="opt">(opcional)</span></label>
              <div className="tag-wrap">
                {VIEWS.map((t) => (
                  <button type="button" key={t}
                    className={`tag ${formData.views.includes(t) ? 'is-active' : ''}`}
                    aria-pressed={formData.views.includes(t)}
                    onClick={() => toggle('views', t)}>{t}</button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="step-intro">Tu opinión importa. La compararemos con los datos reales de venta en {formData.municipality || 'tu zona'} para darte una valoración honesta.</p>
              <label className="field-label" htmlFor="ownerPrice">Precio estimado</label>
              <div className="price-input">
                <input id="ownerPrice" type="text" inputMode="numeric" placeholder="350.000"
                  value={formData.ownerPrice} onChange={(e) => set('ownerPrice', formatThousands(e.target.value))} />
                <span>€</span>
              </div>
              <div className="tag-wrap price-hints">
                {PRICE_HINTS.map((p) => (
                  <button type="button" key={p} className="tag" onClick={() => set('ownerPrice', formatThousands(p))}>
                    {p >= 1000000 ? '1M €' : `${p / 1000}k €`}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <label className="field-label" htmlFor="name">Nombre</label>
              <input id="name" className="field-input" type="text" autoComplete="name" placeholder="Tu nombre"
                value={formData.name} onChange={(e) => set('name', e.target.value)} />

              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" className="field-input" type="email" autoComplete="email" placeholder="tu@email.com"
                value={formData.email} onChange={(e) => set('email', e.target.value)} />

              <label className="field-label">Teléfono móvil</label>
              <PhoneInput id="phone" international defaultCountry="ES" value={formData.phone}
                onChange={(v) => set('phone', v || '')} className="phone-field" />
              <p className="hint">📞 Te llamaremos para contrastar los datos y entregarte la valoración.</p>

              <label className="check-row">
                <input type="checkbox" id="privacy" checked={formData.privacy} onChange={(e) => set('privacy', e.target.checked)} />
                <span>Acepto la <a href="/politica-de-privacidad" target="_blank" rel="noopener">política de privacidad</a> y ser contactado por Alternativa Málaga.</span>
              </label>
            </>
          )}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {status === 'error' && <p className="form-error" role="alert">No hemos podido enviar tu solicitud. Inténtalo de nuevo.</p>}

        <div className="wizard-actions">
          {step > 1 && (
            <button type="button" className="btn btn-ghost" onClick={back} disabled={status === 'submitting'}>Atrás</button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" id={`next-step-${step}`} className="btn btn-primary" onClick={next}>
              Continuar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          ) : (
            <button type="submit" id="submit-valuation" className="btn btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Enviando…' : 'Recibir mi valoración'}
            </button>
          )}
        </div>
        <p className="wizard-trust">🔒 100% gratuito y confidencial · Sin compromiso</p>
      </form>
    </div>
  );
}
