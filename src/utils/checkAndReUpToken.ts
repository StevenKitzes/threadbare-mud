import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import jwt from 'jsonwebtoken';
import { ReUpResult, User } from "@/types";
import { readUserBySession, writeSessionToUser } from "../../sqlite/sqlite";
import getJwt from "./jwt";

export const checkAndReUpToken = (tokenCookie: RequestCookie | undefined): ReUpResult => {
  if (!tokenCookie) return false;

  const token: string = tokenCookie.value;

  try {
    // verify it is not expired
    jwt.verify(token, process.env.JWT_SECRET);
    // verify it belongs to an actual user
    const user: User | undefined = readUserBySession(token);
    if (user === undefined) {
      console.info("Got valid JWT but no matching user.");
      return false;
    }
    const newToken = getJwt();
    writeSessionToUser(user.id, newToken);
    return {
      token: newToken,
      user
    };
  } catch (err: any) {
    // if it is expired
    if (err.toString().includes("TokenExpiredError")) {
      console.info("Token found but was expired.");
      return false;
    }
    console.error("Problem with JWT verification.");
    return false;
  }
}
