import { NextResponse } from "next/server";

import jStr from "./jStr";

export const killCookieResponse = (
  responseBody: {
    message: string,
    status: number
  }
): NextResponse => {
  return new NextResponse(jStr(responseBody), {
    headers: { 'Set-Cookie': `token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/` },
    status: responseBody.status
  });
}

export default killCookieResponse;
