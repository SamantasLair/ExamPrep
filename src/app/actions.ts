'use server';

import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'superSeecreetPassword';

// Token sederhana untuk mengenali sesi auth (hanya sebagai contoh sederhana)
const AUTH_TOKEN = 'exaprep-admin-authenticated';

export async function loginAdminAction(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
    });
    return true;
  }
  return false;
}

export async function checkAdminAuthAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === AUTH_TOKEN;
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

