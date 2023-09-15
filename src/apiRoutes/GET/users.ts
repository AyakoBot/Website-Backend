import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (req: Express.Request, res: Express.Response) => {
  if (!req.query.id) {
    res.sendStatus(400);
    return;
  }

  const IDs = Array.isArray(req.query.id) ? req.query.id : [req.query.id];
  const dbRes = await DataBase.users.findMany({ where: { userid: { in: IDs as string[] } } });

  res.json(dbRes);
};
