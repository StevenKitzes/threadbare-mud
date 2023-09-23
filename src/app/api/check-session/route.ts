import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ApiResponse } from '@/types';
import jStr from '@/utils/jStr';
import getJwt from '@/utils/jwt';
import { readUserBySession, writeSessionToUser } from '../../../../sqlite/sqlite';
import killCookieResponse from '@/utils/killCookieResponse';

const err401: ApiResponse = {
  message: "Session invalid.",
  status: 401
};
const err500: ApiResponse = {
  message: "Server error detected.",
  status: 500
};

export async function POST() {
  const clientToken = cookies().get('token');
  let user;

  // if browser provided a token cookie
  if (clientToken) {
    try {
      // verify it is not expired
      jwt.verify(clientToken.value, process.env.JWT_SECRET);
      // verify it belongs to an actual user
      user = readUserBySession(clientToken.value);
      if (user === undefined) {
        console.info("Client tried to validate session with valid JWT but no matching user.");
        return killCookieResponse(err401);
      }
    } catch (err: any) {
      // if it is expired
      if (err.toString().includes("TokenExpiredError")) {
        return killCookieResponse(err401);
      }
      return killCookieResponse(err500);
    }
  } else { // no token at all
    return killCookieResponse(err401);
  }

  // if nothing has gone wrong by here, we have a valid, un-expired token!
  const status = 200;
  const success: ApiResponse = {
    message: "Valid session, re-upping.",
    status
  };
  const token = getJwt();
  writeSessionToUser(user.id, token);
  return new NextResponse(jStr(success), {
    headers: { 'Set-Cookie': `token=${token}; path=/` },
    status
  });
}  
