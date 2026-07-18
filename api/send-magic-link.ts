import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env['RESEND_API_KEY'] || '';
const SUPABASE_URL = process.env['SUPABASE_URL'] || '';
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';
const APP_URL = process.env['APP_URL'] || 'http://localhost:4200';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function createHmac(secret: string): {
  sign: (payload: string) => string;
  verify: (payload: string, signature: string) => boolean;
} {
  const { createHmac, timingSafeEqual } = require('crypto') as typeof import('crypto');
  return {
    sign(payload: string) {
      return createHmac('sha256', secret).update(payload).digest('base64url');
    },
    verify(payload: string, signature: string) {
      const expected = createHmac('sha256', secret).update(payload).digest('base64url');
      return (
        signature.length === expected.length &&
        timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      );
    },
  };
}

function signToken(email: string, secret: string): string {
  const hmac = createHmac(secret);
  const payload = JSON.stringify({ email, exp: Date.now() + 15 * 60 * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  return `${encoded}.${hmac.sign(encoded)}`;
}

async function getSupabaseMagicLink(email: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ type: 'magiclink', email, options: { redirectTo: `${APP_URL}/dashboard` } }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { properties?: { action_link?: string } };
    return data.properties?.action_link || null;
  } catch {
    return null;
  }
}

function buildEmailHtml(link: string): string {
  return `
    <div dir="rtl" style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:480px;margin:0 auto;padding:28px 24px;background:#0b0617;color:#f3eefc;border-radius:16px;border:1px solid #2a2040;">
      <div style="font-size:24px;margin-bottom:16px;">🔗 <strong style="background:linear-gradient(135deg,#a855f7,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">وصلة</strong></div>
      <h2 style="color:#f3eefc;margin:0 0 12px;">رابط الدخول إلى حسابك</h2>
      <p style="color:#a99fc4;line-height:1.7;margin:0 0 20px;">مرحباً! اضغط على الزر أدناه لتسجيل الدخول إلى حسابك في وصلة.</p>
      <a href="${link}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">تسجيل الدخول</a>
      <p style="color:#a99fc4;font-size:13px;margin-top:20px;line-height:1.6;">هذا الرابط صالح لمدة <strong>15 دقيقة</strong> ويُستخدم مرة واحدة.</p>
      <p style="color:#6b6387;font-size:12px;margin-top:12px;">إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.</p>
      <hr style="border:none;border-top:1px solid #2a2040;margin:20px 0;" />
      <p style="color:#6b6387;font-size:11px;">وصلة — اجمع كل روابطك في صفحة واحدة</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = (req.body || {}) as { email?: string };
    if (!email?.trim()) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب.' });
    }

    const normalized = email.trim().toLowerCase();

    // 1) Try Supabase admin magic link (Resend just delivers it)
    let magicLink = await getSupabaseMagicLink(normalized);

    // 2) Fallback: own signed token
    const tokenSecret = RESEND_API_KEY || SUPABASE_SERVICE_KEY || 'wasla-local-secret';
    if (!magicLink) {
      const token = signToken(normalized, tokenSecret);
      magicLink = `${APP_URL}/auth?token=${encodeURIComponent(token)}`;
    }

    // 3) Send via Resend (or return link in demo mode)
    if (!RESEND_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'وضع العرض — تم إنشاء رابط الدخول (بدون خادم بريد).',
        link: magicLink,
      });
    }

    const resendClient = new Resend(RESEND_API_KEY);
    const { error } = await resendClient.emails.send({
      from: 'Wasla <noreply@wasla.app>',
      to: normalized,
      subject: 'رابط الدخول إلى وصلة',
      html: buildEmailHtml(magicLink),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'تعذّر إرسال البريد الإلكتروني.' });
    }

    return res.status(200).json({ success: true, message: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني.' });
  } catch (err: unknown) {
    console.error('send-magic-link error:', err);
    return res.status(500).json({ error: 'خطأ غير متوقع.' });
  }
}
