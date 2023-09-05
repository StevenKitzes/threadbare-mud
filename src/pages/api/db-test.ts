import type { NextApiRequest, NextApiResponse } from 'next';

import { transact, writeScene, writeItem } from '@/sqlite/sqlite';
 
type ResponseData = {
  message: string
};
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    transact([
      writeScene('testSceneId', 'testSceneName'),
      writeItem('testItemId', 'testItemName')
    ]);
  } catch (err: any) {
    res.status(500).send({
      message: `DB test transaction error: ${err.toString()}`
    });
  }
  res.status(200).send({
    message: "Transaction successful"
  })
}
