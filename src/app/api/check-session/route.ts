import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ReUpResult } from '@/types';
import jStr from '@/utils/jStr';
import killCookieResponse from '@/utils/killCookieResponse';
import { err401 } from '@/utils/apiResponses';
import { checkAndReUpToken } from '@/utils/checkAndReUpToken';

export async function POST() {
  const tokenCookie = cookies().get('token');
  const result: ReUpResult = checkAndReUpToken(tokenCookie);

  if (!result) return killCookieResponse(err401());

  return new NextResponse(jStr({ username: result.user.username }), {
    headers: { 'Set-Cookie': `token=${result.token}; path=/` },
    status: 200
  });
}  
