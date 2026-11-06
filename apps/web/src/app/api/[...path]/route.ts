import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REQUEST_SKIP = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);
const RESPONSE_SKIP = new Set([
  'set-cookie',
  'transfer-encoding',
  'content-encoding',
  'content-length',
]);

function apiBase() {
  return (process.env.API_INTERNAL_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`${apiBase()}/api/${path.map(encodeURIComponent).join('/')}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!REQUEST_SKIP.has(key.toLowerCase())) headers.set(key, value);
  });

  try {
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });

    const out = new Headers();
    response.headers.forEach((value, key) => {
      if (!RESPONSE_SKIP.has(key.toLowerCase())) out.set(key, value);
    });
    for (const cookie of response.headers.getSetCookie?.() ?? []) {
      out.append('set-cookie', cookie);
    }
    return new Response(response.body, { status: response.status, headers: out });
  } catch {
    return Response.json({ code: 'UNAVAILABLE' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
