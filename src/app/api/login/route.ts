import { NextRequest, NextResponse } from 'next/server';

import { readUserByName, writeSessionToUser } from '../../../../sqlite/sqlite';
import { ApiResponse, LoginPayload, User } from '@/types';
import getJwt from '@/utils/jwt';
import jStr from '@/utils/jStr';

import bcrypt from 'bcrypt';

const err401: ApiResponse = {
  message: "Unrecognized user credential detected.",
  status: 401
};
const err500: ApiResponse = {
  message: "Server error detected.",
  status: 500
};

export async function POST(req: NextRequest) {
  const requestPayload: LoginPayload = await req.clone().json();
  
  try {
    const user: User | undefined = await readUserByName(requestPayload.user);

    if (!user) {
      return new NextResponse(jStr(err401), {
        headers: { 'Set-Cookie': `token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/` },
        status: err401.status
      });
    }

    return bcrypt.compare(requestPayload.pass, user.password)
      .then((result) => {
        // if result bool is true, we have password match
        if (result) {
          const status = 200;
          const success: ApiResponse = {
            message: "Login successful.",
            status
          };
          const token = getJwt();
          writeSessionToUser(user.id, token);
          return new NextResponse(jStr(success), {
            headers: { 'Set-Cookie': `token=${token}; path=/`},
            status
          });
        }

        // otherwise, we have bad password match
        console.log("User login attempt with mismatched credentials.");
        return new NextResponse(jStr(err401), {
          headers: { 'Set-Cookie': `token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/` },
          status: err401.status
        });
      })
      .catch((err) => {
        console.error("bcrypt error in login api route.", err.toString());
        return new NextResponse(jStr(err500), {
          headers: { 'Set-Cookie': `token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/` },
          status: err500.status
        });
      });
  } catch ( err: any ) {
    const errString: string = err.toString();
    console.error("Error in login API", errString);
    return new NextResponse(jStr(err500), {
      headers: { 'Set-Cookie': `token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/` },
      status: err500.status
    });
  }
}
