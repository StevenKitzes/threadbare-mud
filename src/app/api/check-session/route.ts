import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ConfirmedUser } from '@/types';
import jStr from '@/utils/jStr';
import killCookieResponse from '@/utils/killCookieResponse';
import { err401 } from '@/utils/apiResponses';
import { getUserFromToken } from '@/utils/getUserFromToken';

export async function POST() {
  const tokenCookie = cookies().get('token');
  const result: ConfirmedUser = getUserFromToken(tokenCookie);

  if (!result) return killCookieResponse(err401());

  return new NextResponse(jStr({ username: result.user.username }), {
    status: 200
  });
}  
