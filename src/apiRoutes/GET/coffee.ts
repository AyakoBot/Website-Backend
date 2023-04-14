import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_req: Express.Request, res: Express.Response) => {
  DataBase.query(`UPDATE users SET avatar = $1 WHERE avatar IS NULL;`, [
    'https://cdn.discordapp.com/embed/avatars/1.png',
  ]);

  res.sendStatus(418);
};
