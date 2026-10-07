import crypto from 'crypto';

/* ─────────────────────────────────────────────────────────────
   Lógica compartida de captación – Alternativa Málaga
   Usada por:  /api/kommo.js (Vercel)  y  vite.config.js (dev)
   ───────────────────────────────────────────────────────────── */

const KOMMO_TOKEN = process.env.KOMMO_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNkY2E0OGQyNDQzNThmMDE0OGRhZGQzM2MxM2NhMzg1YTcxZGVjMDRkZmQzMTVmNzQxOGY1ODAxOTEwYWYwMjI2NzgwMzllOGRhZjVlNzJmIn0.eyJhdWQiOiI3YzljOWU0Yy05ZTFjLTQ0YWEtYjY1Mi0zNWIwZTAwY2RhOWUiLCJqdGkiOiIzZGNhNDhkMjQ0MzU4ZjAxNDhkYWRkMzNjMTNjYTM4NWE3MWRlYzA0ZGZkMzE1Zjc0MThmNTgwMTkxMGFmMDIyNjc4MDM5ZThkYWY1ZTcyZiIsImlhdCI6MTc3NDM2NTA1MSwibmJmIjoxNzc0MzY1MDUxLCJleHAiOjE5MDY0MTYwMDAsInN1YiI6IjE0OTE2Mzk1IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM2MTczNzExLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYmYwYzM3ZTItZDI0ZS00NzFmLTg3ZjAtNGZlNTQ5MmI5NjU3IiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.QDtrQqYG1YJ-8A4Kr1VhlRdF2mgcy0sVEUL8HpSMiAshKue_yf7-nJFtir_3pQRAcIqyuodS116z8bWtKjYT6scvI0xpnhJ-i6GfbM4upiCExuIqUJ7TJCKFRPROGKjVg2ji-6wdrqrwDWifpSL4NmiS49XbH6XDYvKhsta4JguxOhoqgawZhxpdh3y9aANQPknob5l4DygP0yC7_2hhzfQiuyQocY5ai2b01chw6U7FVxelCiW0K_ZXBZf2IxYOTAD-o_CedIGUjJ2nKgynd7ne1N4l-m74XPpO2V2PDlmoFMZUsBBFAAMxqzJ1orGkF-O8afj-naeggbWcBfAEXQ';
const KOMMO_BASE = 'https://pedropablocastro1995.kommo.com';

// Pipeline "Alternativa_Captacion" → etapa "Contacto inicial"
// (la etapa "Leads Entrantes" es la bandeja de entrantes de Kommo y no admite leads vía API)
const PIPELINE_ID = 14581508;
const STATUS_ID = 112654548;

// Meta Pixel / Conversions API
const META_PIXEL_ID = '4456499001230330';
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN || '';

// IDs de campos personalizados del lead en Kommo
const FIELDS = {
    operation: 1205040,     // Operación
    propertyType: 1205042,  // Tipo de Inmueble
    address: 1205044,       // Dirección del Inmueble
    surface: 1205046,       // Superficie (m2) [numérico]
    rooms: 1205048,         // Habitaciones
    bathrooms: 1205050,     // Baños
    condition: 1205054,     // Estado del Inmueble
    features: 1205060,      // Características
    views: 1205062,         // Vistas
    phone: 1205066,         // Teléfono Lead
    email: 1205068,         // Email Lead
    municipality: 1383131,  // Municipio
    ownerPrice: 1383133,    // Precio estimado propietario
};

// Campos de tracking nativos de Kommo (UTMs / fbclid)
const TRACKING_FIELDS = {
    utm_source: 1077342,
    utm_medium: 1077338,
    utm_campaign: 1077340,
    utm_content: 1077336,
    utm_term: 1077344,
    fbclid: 1077354,
};

const hashData = (value) => {
    if (!value) return '';
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
};

const formatEUR = (n) => {
    const num = parseInt(String(n).replace(/\D/g, ''), 10);
    if (!num) return '';
    return new Intl.NumberFormat('es-ES').format(num) + ' €';
};

const field = (id, value) => {
    if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) return null;
    return { field_id: id, values: [{ value }] };
};

/**
 * Valida y envía el lead a Kommo (+ Meta CAPI).
 * @returns {Promise<{status:number, body:object}>}
 */
export async function processLead(data = {}, meta = {}) {
    const required = ['municipality', 'propertyType', 'address', 'rooms', 'bathrooms', 'ownerPrice', 'name', 'phone', 'email'];
    const missing = required.filter((k) => !data[k]);
    if (missing.length) {
        return { status: 400, body: { error: 'Faltan campos obligatorios', missing } };
    }

    const features = Array.isArray(data.features) ? data.features.join(', ') : '';
    const views = Array.isArray(data.views) ? data.views.join(', ') : '';
    const ownerPriceNum = parseInt(String(data.ownerPrice).replace(/\D/g, ''), 10) || 0;
    const ownerPriceText = formatEUR(data.ownerPrice);
    const surfaceNum = parseInt(data.surface, 10);

    const leadName = `Valoración ${data.propertyType} · ${data.municipality} – ${data.name}`;

    const customFields = [
        field(FIELDS.operation, 'Venta'),
        field(FIELDS.municipality, data.municipality),
        field(FIELDS.propertyType, data.propertyType),
        field(FIELDS.address, data.address),
        field(FIELDS.surface, isNaN(surfaceNum) ? null : surfaceNum),
        field(FIELDS.rooms, String(data.rooms)),
        field(FIELDS.bathrooms, String(data.bathrooms)),
        field(FIELDS.condition, data.condition),
        field(FIELDS.features, features || 'Ninguna'),
        field(FIELDS.views, views || 'Ninguna'),
        field(FIELDS.ownerPrice, ownerPriceText),
        field(FIELDS.phone, data.phone),
        field(FIELDS.email, data.email),
    ];

    const tracking = data.tracking || {};
    Object.entries(TRACKING_FIELDS).forEach(([key, id]) => {
        if (tracking[key]) customFields.push(field(id, String(tracking[key]).slice(0, 250)));
    });

    const kommoPayload = [{
        name: leadName,
        price: ownerPriceNum || undefined,
        pipeline_id: PIPELINE_ID,
        status_id: STATUS_ID,
        custom_fields_values: customFields.filter(Boolean),
        _embedded: {
            tags: [
                { name: 'Valoración' },
                { name: 'Landing Captación' },
                { name: data.municipality },
            ],
            contacts: [{
                name: data.name,
                custom_fields_values: [
                    { field_code: 'PHONE', values: [{ value: data.phone, enum_code: 'MOB' }] },
                    { field_code: 'EMAIL', values: [{ value: data.email, enum_code: 'WORK' }] },
                ],
            }],
        },
    }];

    const noteText = [
        '📌 DATOS DEL PROPIETARIO',
        `Nombre: ${data.name}`,
        `Teléfono: ${data.phone}`,
        `Email: ${data.email}`,
        '',
        '🏠 DATOS DE LA VIVIENDA',
        `Municipio: ${data.municipality}`,
        `Tipo: ${data.propertyType}`,
        `Dirección: ${data.address}`,
        `Habitaciones: ${data.rooms}`,
        `Baños: ${data.bathrooms}`,
        `Superficie: ${data.surface || '—'} m²`,
        `Estado: ${data.condition || '—'}`,
        `Extras: ${features || 'Ninguno'}`,
        `Vistas: ${views || 'Ninguna'}`,
        '',
        `💶 PRECIO QUE ESPERA EL PROPIETARIO: ${ownerPriceText}`,
    ].join('\n');

    const kommoHeaders = {
        Authorization: `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
    };

    // Meta Conversions API (solo si hay token configurado). Se deduplica con el Pixel vía event_id.
    let metaPromise = Promise.resolve(null);
    if (META_CAPI_TOKEN) {
        const userData = {
            em: [hashData(data.email)],
            ph: [hashData(String(data.phone).replace(/[^0-9]/g, ''))],
            fn: [hashData(String(data.name).split(' ')[0])],
            ct: [hashData(String(data.municipality).replace(/\s/g, ''))],
            country: [hashData('es')],
        };
        if (meta.ip) userData.client_ip_address = meta.ip;
        if (meta.userAgent) userData.client_user_agent = meta.userAgent;
        if (data.fbp) userData.fbp = data.fbp;
        if (data.fbc) userData.fbc = data.fbc;

        metaPromise = fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{
                    event_name: 'Lead',
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_id: data.eventId || crypto.randomUUID(),
                    event_source_url: meta.url || undefined,
                    user_data: userData,
                }],
            }),
        }).catch((err) => { console.error('[ALTERNATIVA] Meta CAPI (no fatal):', err); return null; });
    }

    const [kommoResponse] = await Promise.all([
        fetch(`${KOMMO_BASE}/api/v4/leads/complex`, {
            method: 'POST',
            headers: kommoHeaders,
            body: JSON.stringify(kommoPayload),
        }),
        metaPromise,
    ]);

    if (!kommoResponse.ok) {
        const errText = await kommoResponse.text();
        console.error('[ALTERNATIVA] Kommo API Error:', errText);
        return { status: kommoResponse.status, body: { error: 'Error del servidor CRM externo', details: errText } };
    }

    try {
        const responseData = await kommoResponse.json();
        const leadId = responseData[0]?.id;
        console.log(`[ALTERNATIVA] Lead creado: ${leadId} en pipeline ${PIPELINE_ID}`);
        if (leadId) {
            await fetch(`${KOMMO_BASE}/api/v4/leads/notes`, {
                method: 'POST',
                headers: kommoHeaders,
                body: JSON.stringify([{ entity_id: leadId, note_type: 'common', params: { text: noteText } }]),
            });
        }
        return { status: 200, body: { success: true, leadId } };
    } catch (err) {
        console.error('[ALTERNATIVA] No se pudo adjuntar la nota:', err);
        return { status: 200, body: { success: true } };
    }
}
