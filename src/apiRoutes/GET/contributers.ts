import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_req: Express.Request, res: Express.Response) => {
  const dbRes = await DataBase.contributers.findMany({ where: {} });

  if (!dbRes) {
    res.json([]);
    return;
  }

  const userRes = await DataBase.users.findMany({
    where: { userid: { in: dbRes.map((r) => r.userid) } },
  });

  const mergedObjects = dbRes.map((r) => {
    const userRow = userRes.find((u) => u.userid === r.userid);
    return { ...userRow, ...r };
  });

  res.json(mergedObjects.reverse());
};
