import { processLead } from './_lead.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const meta = {
            ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || undefined,
            userAgent: req.headers['user-agent'],
            url: req.headers['referer'],
        };
        const { status, body } = await processLead(req.body || {}, meta);
        return res.status(status).json(body);
    } catch (err) {
        console.error('[ALTERNATIVA] Server Error:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
