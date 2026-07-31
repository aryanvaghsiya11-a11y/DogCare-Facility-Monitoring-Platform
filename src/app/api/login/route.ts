import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'dcare_session';

export async function POST() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, 'mock_session_token', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  return NextResponse.json({ ok: true, user: { id: 'dev-1', name: 'Demo Admin', role: 'owner' } });
}
