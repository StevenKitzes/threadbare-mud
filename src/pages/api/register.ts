import type { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { ApiResponse, RegistrationPayload } from '@/types';
import { transact, writeUser } from '../../../sqlite/sqlite';
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const payload: RegistrationPayload = req.body;

  try {
    console.info("register request detected");
    bcrypt.hash(payload.pass, 12, function(err, hash) {
      console.info("bcrypt callback in register");
      if (err) {
        console.error("Error: problem hashing password");
        return res.status(500).send({
          message: `Server error with in registration function.`,
          status: 500
        });
      } else {
        console.info("no error in bcrypt callback");
      }
      console.info("trying to transact . . .");
      try {
        transact([
          writeUser(uuid(), payload.user, hash, payload.email)
        ]);
      } catch (err: any) {
        const errString = err.toString();
        console.log("Error: Caught in register API", errString);
        if (errString.includes('UNIQUE') && errString.includes('.email')) {
          console.log("Found duplicate email address");
          return res.status(400).send({
            message: `This email address has already been used by someone.`,
            status: 400
          });
        }
        if (errString.includes('UNIQUE') && errString.includes('.username')) {
          console.log("Found duplicate user name");
          return res.status(400).send({
            message: `This user name has already been used by someone.`,
            status: 400
          });
        }
      }
      console.info("transact succeeded");
      return res.status(200).send({
        message: "Transaction successful",
        status: 200
      })
    });
  } catch (err: any) {
    return res.status(500).send({
      message: `DB transaction error: ${err.toString()}`,
      status: 500
    });
  }
}
