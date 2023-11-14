import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { writeActiveCharacter } from '../../../../sqlite/sqlite';
import { ConfirmedUser, User } from '@/types';
import killCookieResponse from '@/utils/killCookieResponse';
import { err401, err500, success200 } from '@/utils/apiResponses';
import { getUserFromToken } from '@/utils/getUserFromToken';
import jStr from '@/utils/jStr';
import { errorParts } from '@/utils/log';

export async function POST(req: NextRequest) {
  // Handle auth stuff


  const tokenCookie = cookies().get('token');
  const result: ConfirmedUser = getUserFromToken(tokenCookie);

  if (!result) return killCookieResponse(err401());
  
  // Handle business logic
  const { id } = await req.clone().json();
  
  try {
    const user: User = result.user;
    writeActiveCharacter(user.id, id);
    return new NextResponse(jStr(success200("New character selected successfully")), {
      status: 200
    });
  } catch ( err: any ) {
    const errString: string = err.toString();
    errorParts(["Error in character selection API", errString]);
    return new NextResponse(jStr(err500("Error on server while selecting character.")), {
      status: 500
    });
  }
}
