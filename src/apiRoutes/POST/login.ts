import type Express from 'express';
import fetch from 'node-fetch';
import DataBase from '../../DataBase.js';
import * as Types from '../../../submodules/Ayako-v1.6/src/Typings/CustomTypings';
import { getAvatar } from '../../modules/discord.js';
import type { QueryResult } from 'pg';

export default async (req: Express.Request, res: Express.Response) => {
  const token = req.body.token as string;
  if (!token) {
    res.sendStatus(400);
    return;
  }

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userRes.ok) {
    res.sendStatus(401);
    return;
  }

  const user = (await userRes.json()) as Types.RawUser;

  const transmittedUserData = await DataBase.query(
    `INSERT INTO users (userid, username, avatar, lastfetch, email, token) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (userid) DO UPDATE SET username = $2, avatar = $3, lastfetch = $4, email = $5, token = $6 RETURNING username, avatar, userid;`,
    [user.id, user.username, getAvatar(user), Date.now(), user.email, token],
  ).then((r: QueryResult<{ userid: string; username: string; avatar: string }>) => r.rows[0]);

  res.status(200).send(transmittedUserData);
};
