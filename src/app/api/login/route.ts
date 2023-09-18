import { NextRequest, NextResponse } from 'next/server';

import { ApiResponse, LoginPayload, User } from '@/types';
import jStr from '@/utils/jStr';
import { readUserByName } from '../../../../sqlite/sqlite';

import bcrypt from 'bcrypt';

const err404: ApiResponse = {
  message: "Unrecognized user credential detected.",
  status: 404
};
const err500: ApiResponse = {
  message: "Server error detected.",
  status: 500
}

export async function POST(req: NextRequest) {
  const requestPayload: LoginPayload = await req.clone().json();

  try {
    const user: User | undefined = await readUserByName(requestPayload.user);

    if (!user) {
      return new NextResponse(jStr(err404), { status: err404.status });
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
          return new NextResponse(jStr(success), { status });
        }

        // otherwise, we have bad password match
        console.log("User login attempt with mismatched credentials.");
        return new NextResponse(jStr(err404), { status: err404.status });
      })
      .catch((err) => {
        console.error("bcrypt error in login api route.", err.toString());
        return new NextResponse(jStr(err500), { status: err500.status });
      });
  } catch ( err: any ) {
    const errString: string = err.toString();
    console.error("Error in login API", errString);
    return new NextResponse(jStr(err500), { status: err500.status });
  }
}
