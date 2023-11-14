import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import jwt from 'jsonwebtoken';
import { ConfirmedUser, User } from "@/types";
import { readUserBySession } from "../../sqlite/sqlite";

export const getUserFromToken = (tokenCookie: RequestCookie | undefined): ConfirmedUser => {
  if (!tokenCookie) return false;

  const token: string = tokenCookie.value;

  try {
    // verify it is not expired
    jwt.verify(token, process.env.JWT_SECRET);
    // verify it belongs to an actual user
    const user: User | undefined = readUserBySession(token);
    if (user === undefined) {
      console.info("Got valid JWT but no matching user in user retrieval.");
      return false;
    }
    return {
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
