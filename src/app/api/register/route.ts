import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { ApiResponse, RegistrationPayload } from '@/types';
import { transact, writeUser } from '../../../../sqlite/sqlite';
import jStr from '@/utils/jStr';
import { errorParts } from '@/utils/log';
 
export async function POST( req: NextRequest ) {


  const requestPayload: RegistrationPayload = await req.clone().json();

  try {
    return bcrypt.hash(requestPayload.pass, 12)
      .then((hash) => {
        try {
          transact([
            writeUser(uuid(), requestPayload.user, hash, requestPayload.email)
          ]);
        } catch (err: any) {
          const errString = err.toString();
          errorParts(["Error caught in register API", errString]);
          if (errString.includes('UNIQUE') && errString.includes('.email')) {
            const err400: ApiResponse = {
              message: "This email address was already used.",
              status: 400
            };
            return new NextResponse(jStr(err400), { status: err400.status });
          }
          if (errString.includes('UNIQUE') && errString.includes('.username')) {
            const err400: ApiResponse = {
              message: "This user name was already used.",
              status: 400
            };
            return new NextResponse(jStr(err400), { status: err400.status });
          }
          // less predictable errors caught here:
          const err500: ApiResponse = {
            message: "Server error detected.",
            status: 500
          };
          return new NextResponse(jStr(err500), { status: err500.status });
        }

        // transact succeeded
        const success: ApiResponse = {
          message: "Register successful.",
          status: 200
        };
        return new NextResponse(jStr(success), { status: success.status });
      })
  } catch (err: any) {
    errorParts(["bcrypt error in register api route handler.", err.toString()]);
    const err500: ApiResponse = {
      message: "Server error detected.",
      status: 500
    };
    return new NextResponse(jStr(err500), { status: err500.status });
  }
}
