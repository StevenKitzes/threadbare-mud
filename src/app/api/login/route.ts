import { NextRequest, NextResponse } from 'next/server';

import { readUserByName, writeSessionToUser } from '../../../../sqlite/sqlite';
import { ApiResponse, LoginPayload, User } from '@/types';
import getJwt from '@/utils/jwt';
import jStr from '@/utils/jStr';

import bcrypt from 'bcrypt';
import killCookieResponse from '@/utils/killCookieResponse';
import { err401, err500 } from '@/utils/apiResponses';
import { errorParts, log } from '@/utils/log';

export async function POST(req: NextRequest) {


  const requestPayload: LoginPayload = await req.clone().json();
  
  try {
    const user: User | undefined = await readUserByName(requestPayload.user);

    if (!user) {
      log("User not found by name in login flow.");
      return killCookieResponse(err401());
    }

    return bcrypt.compare(requestPayload.pass, user.password)
      .then((result) => {
        // if result bool is true, we have password match
        if (result) {
          const status = 200;
          const success: ApiResponse = {
            message: "Login successful.",
            status,
            username: user.username
          };
          const token = getJwt();
          writeSessionToUser(user.id, token);
          return new NextResponse(jStr(success), {
            headers: { 'Set-Cookie': `token=${token}; path=/`},
            status
          });
        }

        // otherwise, we have bad password match
        log("User login attempt with mismatched credentials.");
        return killCookieResponse(err401());
      })
      .catch((err) => {
        errorParts(["bcrypt error in login api route.", err.toString()]);
        return killCookieResponse(err500());
      });
  } catch ( err: any ) {
    const errString: string = err.toString();
    errorParts(["Error in login API", errString]);
    return killCookieResponse(err500());
  }
}
