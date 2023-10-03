import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 } from 'uuid';

import { transact, writeNewCharacter } from '../../../../sqlite/sqlite';
import { ReUpResult } from '@/types';
import killCookieResponse from '@/utils/killCookieResponse';
import { err400, err401, err500, success200 } from '@/utils/apiResponses';
import { checkAndReUpToken } from '@/utils/checkAndReUpToken';
import jStr from '@/utils/jStr';

export async function POST(req: NextRequest) {
  // Handle auth stuff
  const tokenCookie = cookies().get('token');
  const result: ReUpResult = checkAndReUpToken(tokenCookie);

  if (!result) return killCookieResponse(err401());
  
  try {
    const charId: string = v4();
    const userId: string = result.user.id;
    const { name } = await req.clone().json();
    
    transact([
      writeNewCharacter(charId, userId, name)
    ]);
    
    return new NextResponse(jStr(success200("New character created successfully")), {
      headers: { 'Set-Cookie': `token=${result.token}; path=/` },
      status: 200
    });
  } catch ( err: any ) {
    const errString: string = err.toString();
    console.error("Error in character creation API", errString);
    if (errString.includes("UNIQUE")) {
      return new NextResponse(jStr(err400("Character name already in use.")), {
        headers: { 'Set-Cookie': `token=${result.token}; path=/` },
        status: 400
      });
    }
    return new NextResponse(jStr(err500()), {
      headers: { 'Set-Cookie': `token=${result.token}; path=/` },
      status: 500
    });  }
}
