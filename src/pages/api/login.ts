import type { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcrypt';

import { ApiResponse, LoginPayload, User } from '@/types';
import { readUserByName } from '../../../sqlite/sqlite';
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const payload: LoginPayload = req.body;

  try {
    const user: User | null = readUserByName(payload.user);
    if (user === null) {
      console.log("User login attempt with unknown user name");
      return res.status(404).send({
        message: `Unknown login credential.`,
        status: 404
      });
    }
    bcrypt.compare(payload.pass, user.password, function(err, result) {
      if (err) {
        console.error(`Error: problem comparing user pass against stored hash in login function: ${err}`);
        return res.status(500).send({
          message: `Error encountered in login function.`,
          status: 500
        });
      }
      if (result) {
        return res.status(200).send({
          message: `User login successful.`,
          status: 200
        });
      }
      console.log("User login attempt with mismatched credentials");
      return res.status(404).send({
        message: `Unknown login credential.`,
        status: 404
      });
    });
  } catch (err: any) {
    const errString = err.toString();
    console.error("Error: Caught in login API", errString);
    if (errString.includes('UNIQUE') && errString.includes('.email')) {
      console.error("User tried duplicate email address");
      return res.status(400).send({
        message: `This email address has already been used by someone.`,
        status: 400
      });
    }
    if (errString.includes('UNIQUE') && errString.includes('.username')) {
      console.error("User tried duplicate user name");
      return res.status(400).send({
        message: `This user name has already been used by someone.`,
        status: 400
      });
    }
    return res.status(500).send({
      message: `DB transaction error: ${errString}`,
      status: 500
    });
  }
}