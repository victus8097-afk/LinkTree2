import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ---------- env ----------
const RESEND_API_KEY = process.env['RESEND_API_KEY'] || '';
const RESEND_FROM = process.env['RESEND_FROM'] || '';
const SUPABASE_URL = process.env['SUPABASE_URL'] || '';
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';

// ---------- helpers ----------

/** يكتشف رابط التطبيق تلقائياً — يدعم Vercel و Coolify و Heroku وأي host آخر. */
function detectAppUrl(req: VercelRequest): string {
  // Vercel يُدخل VERCEL_URL تلقائياً (مثلاً myproject.vercel.app)
  const vercelUrl = process.env['VERCEL_URL'];
  if (vercelUrl) return `https://${vercelUrl}`;

  // Coolify أو أي host آخر: نستخدم الهيدر
  const host = req.headers['host'] || '';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (host) return `${proto}://${host}`;

  // آخر رجوع
  return process.env['APP_URL'] || 'http://localhost:4200';
}

function createHmac(secret: string) {
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

async function getSupabaseMagicLink(email: string, redirectTo: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({
        type: 'magiclink',
        email,
        options: { redirectTo: `${redirectTo}/dashboard` },
      }),
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

function resolveFromAddress(req: VercelRequest): string {
  if (RESEND_FROM) return RESEND_FROM;

  const host = req.headers['host'] || '';
  if (host) return `Wasla <noreply@${host}>`;

  return 'Wasla <noreply@wasla.app>';
}

// ---------- handler ----------

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const appUrl = detectAppUrl(req);

    // 1) جرّب Supabase admin magic link (Resend يوصّله فقط)
    let magicLink = await getSupabaseMagicLink(normalized, appUrl);

    // 2) رجوع: رمز موقّع ذاتياً (HMAC — لا يحتاج قاعدة بيانات)
    const tokenSecret = RESEND_API_KEY || SUPABASE_SERVICE_KEY || 'wasla-local-secret';
    if (!magicLink) {
      const token = signToken(normalized, tokenSecret);
      magicLink = `${appUrl}?token=${encodeURIComponent(token)}`;
    }

    // 3) إرسال عبر Resend
    if (!RESEND_API_KEY) {
      // لا يوجد Resend — نرجع الرابط مباشرة (مفيد للتطوير)
      return res.status(200).json({
        success: true,
        message: 'وضع التطوير — تم إنشاء رابط الدخول (بدون خادم بريد).',
        link: magicLink,
      });
    }

    const resendClient = new Resend(RESEND_API_KEY);
    const { error } = await resendClient.emails.send({
      from: resolveFromAddress(req),
      to: normalized,
      subject: 'رابط الدخول إلى وصلة',
      html: buildEmailHtml(magicLink),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'تعذّر إرسال البريد الإلكتروني.' });
    }

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني.',
    });
  } catch (err: unknown) {
    console.error('send-magic-link error:', err);
    return res.status(500).json({ error: 'خطأ غير متوقع.' });
  }
}
