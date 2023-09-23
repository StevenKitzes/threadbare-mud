import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import { ApiResponse, User } from '@/types';
import killCookieResponse from '@/utils/killCookieResponse';
import { readUserBySession, writeSessionToUser } from '../../../../sqlite/sqlite';

const success: ApiResponse = {
  message: "Logged out.",
  status: 200
};

export async function GET() {
  const clientToken = cookies().get('token');
  let user: User | undefined;

  // if browser provided a token cookie
  if (clientToken) {
    try {
      // verify it is not expired
      jwt.verify(clientToken.value, process.env.JWT_SECRET);
      // verify it belongs to an actual user
      user = readUserBySession(clientToken.value);
      if (user === undefined) {
        console.info("Client tried to log out with valid JWT but no matching user.");
        return killCookieResponse(success);
      }
      writeSessionToUser(user.id, null);
      return killCookieResponse(success);
    } catch (err: any) {
      // if it is expired
      if (err.toString().includes("TokenExpiredError")) {
        return killCookieResponse(success);
      }
      return killCookieResponse(success);
    }
  } else { // no token at all
    return killCookieResponse(success);
  }}
