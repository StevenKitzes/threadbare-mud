import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { writeActiveCharacter } from '../../../../sqlite/sqlite';
import { ReUpResult, User } from '@/types';
import killCookieResponse from '@/utils/killCookieResponse';
import { err401, err500, success200 } from '@/utils/apiResponses';
import { checkAndReUpToken } from '@/utils/checkAndReUpToken';
import jStr from '@/utils/jStr';

export async function POST(req: NextRequest) {
  // Handle auth stuff
  const tokenCookie = cookies().get('token');
  const result: ReUpResult = checkAndReUpToken(tokenCookie);

  if (!result) return killCookieResponse(err401());
  
  // Handle business logic
  const { id } = await req.clone().json();
  
  try {
    const user: User = result.user;
    writeActiveCharacter(user.id, id);
    
    return new NextResponse(jStr(success200("New character selected successfully")), {
      headers: { 'Set-Cookie': `token=${result.token}; path=/` },
      status: 200
    });
  } catch ( err: any ) {
    const errString: string = err.toString();
    console.error("Error in character selection API", errString);
    return killCookieResponse(err500());
  }
}
