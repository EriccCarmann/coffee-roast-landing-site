import { NextResponse } from 'next/server';
import { validateOrder } from '../../../lib/server/validate';
import { sendToTelegram, telegramConfigured } from '../../../lib/server/telegram';
import { allowAttempt, lastOrderAt, rememberOrder } from '../../../lib/server/guards';

// This file IS the endpoint: POST /api/orders. The exported function name is the HTTP verb
// (like [HttpPost] on a controller action). It receives a standard web `Request`
// and must return a `Response`; NextResponse.json() is a helper for JSON replies.
const MAX_BODY_BYTES = 10_000;

export async function POST(req: Request) {
  // 1) Rate limit by IP (on hosts like Vercel the real IP is the first x-forwarded-for entry)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowAttempt(ip)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  // 2) Read and parse the body defensively
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // 3) Honeypot: a hidden field only bots fill in. Pretend success, send nothing.
  if (typeof body === 'object' && body !== null && (body as { website?: unknown }).website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // 4) Validate
  const result = validateOrder(body);
  if (!result.ok) {
    return NextResponse.json({ error: 'validation', fields: result.errors }, { status: 400 });
  }
  const order = result.value;

  // 5) Same phone twice within 10 minutes (best effort, see guards.ts)
  const previous = lastOrderAt(order.phoneDigits);
  if (previous) return NextResponse.json({ error: 'duplicate', sentAt: previous }, { status: 409 });

  // 6) In production, refuse to "succeed" when nobody would ever receive the order
  if (process.env.NODE_ENV === 'production' && !telegramConfigured()) {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set');
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }

  // 7) Deliver. With no database, Telegram is the only copy: if it fails, tell the customer.
  try {
    await sendToTelegram(order);
  } catch (err) {
    console.error('[telegram] failed:', (err as Error).message);
    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  rememberOrder(order.phoneDigits);
  return NextResponse.json({ ok: true }, { status: 201 });
}
