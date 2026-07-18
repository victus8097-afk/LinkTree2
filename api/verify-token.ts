import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_SECRET =
  process.env['RESEND_API_KEY'] || process.env['SUPABASE_SERVICE_ROLE_KEY'] || 'wasla-local-secret';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function hmacVerify(payload: string, signature: string, secret: string): boolean {
  const { createHmac } = require('crypto') as typeof import('crypto');
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  let ok = signature.length === expected.length;
  if (ok) {
    // constant-time comparison
    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    ok = diff === 0;
  }
  return ok;
}

// ---------------------------------------------------------------------------
// handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token } = (req.body || {}) as { token?: string };
    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) {
      return res.status(400).json({ error: 'رابط غير صالح.' });
    }

    if (!hmacVerify(encoded, sig, TOKEN_SECRET)) {
      return res.status(401).json({ error: 'رابط غير صالح أو منتهي الصلاحية.' });
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as {
      email: string;
      exp: number;
    };

    if (payload.exp && Date.now() > payload.exp) {
      return res.status(401).json({ error: 'انتهت صلاحية رابط الدخول. اطلب رابطاً جديداً.' });
    }

    return res.status(200).json({ success: true, email: payload.email });
  } catch (err: unknown) {
    console.error('verify-token error:', err);
    return res.status(500).json({ error: 'خطأ غير متوقع.' });
  }
}
