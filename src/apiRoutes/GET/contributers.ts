import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_req: Express.Request, res: Express.Response) => {
  const dbRes = await DataBase.query(`SELECT * FROM contributers;`).then((r) =>
    r
      ? (r.rows as {
          userid: string;
        }[])
      : null,
  );

  if (!dbRes) {
    res.json([]);
    return;
  }

  const userRes = await DataBase.query(`SELECT * FROM users WHERE userid = ANY ($1);`, [
    dbRes.map((r) => r.userid),
  ]);

  const mergedObjects = dbRes.map((r) => {
    const userRow = userRes.rows.find((u) => u.userid === r.userid);
    return { ...userRow, ...r };
  });

  res.json(mergedObjects.reverse());
};
