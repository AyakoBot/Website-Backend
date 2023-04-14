import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_: Express.Request, res: Express.Response) => {
  const servers = await DataBase.query('SELECT * FROM guilds;').then((r: any) => r.rows);
  if (!servers) {
    res.sendStatus(500);
    return;
  }

  const count = await DataBase.query('SELECT * FROM stats;').then((r: any) => r.rows[0]);

  res.json({
    servers,
    count: count.guildcount,
    users: count.allusers,
  });
};
