import type Express from 'express';
import type { QueryResult } from 'pg';
import fetch from 'node-fetch';
import DataBase from '../../DataBase.js';
import * as Types from '../../../submodules/Ayako-v1.6/src/Typings/CustomTypings';
import { getAvatar } from '../../modules/discord/getAuthData.js';
import auth from '../../auth.json' assert { type: 'json' };

export default async (req: Express.Request, res: Express.Response) => {
  const code = req.body.code as string;
  if (!code) {
    res.sendStatus(400);
    return;
  }

  const tokenRes = (await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: auth.ayakoOwner.id,
      client_secret: auth.ayakoOwner.secret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://ayakobot.com/login',
    }),
  }).then((r) => r.json())) as {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  };

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${tokenRes.access_token}`,
    },
  });

  if (!userRes.ok) {
    res.sendStatus(401);
    return;
  }

  const user = (await userRes.json()) as Types.RawUser;

  const transmittedUserData = await DataBase.query(
    `INSERT INTO users (userid, username, avatar, lastfetch, email, accesstoken, refreshtoken, expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (userid) DO UPDATE SET username = $2, avatar = $3, lastfetch = $4, email = $5, accesstoken = $6, refreshtoken = $7, expires = $8 RETURNING username, avatar, userid;`,
    [
      user.id,
      user.username,
      getAvatar(user),
      Date.now(),
      user.email,
      tokenRes.access_token,
      tokenRes.refresh_token,
      tokenRes.expires_in + Date.now(),
    ],
  ).then((r: QueryResult<{ userid: string; username: string; avatar: string }>) => r.rows[0]);

  res.status(200).send({ ...transmittedUserData, token: tokenRes.access_token });
};
