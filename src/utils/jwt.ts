import jwt from 'jsonwebtoken';
import { SESSION_TIMEOUT } from '@/constants';

export const getJwt = (seconds: number = SESSION_TIMEOUT): string => {
  return jwt.sign({
    // exp is in seconds
    exp: Math.floor(Date.now() / 1000) + seconds
  }, process.env.JWT_SECRET);
}

export default getJwt;
