import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_: Express.Request, res: Express.Response) => {
  const servers = await DataBase.guilds.findMany({ where: { membercount: { gte: 1000 } } });
  if (!servers) {
    res.sendStatus(500);
    return;
  }

  const count = await DataBase.stats.findFirst();

  res.json({
    servers,
    count: Number(count?.guildcount),
    users: Number(count?.allusers),
  });
};
