import type Express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { APIUser } from 'discord-api-types/v10.js';
import fetch from 'node-fetch';
import DataBase from '../../DataBase.js';
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
      redirect_uri: 'https://ayakobot.com/login',
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

  const user = (await userRes.json()) as APIUser;

  const transmittedUserData = await DataBase.users.upsert({
    where: { userid: user.id },
    update: {
      username: user.username,
      avatar: getAvatar(user),
      lastfetch: Date.now(),
      email: user.email,
      accesstoken: tokenRes.access_token,
      refreshtoken: tokenRes.refresh_token,
      expires: tokenRes.expires_in * 1000 + Date.now(),
    },
    create: {
      userid: user.id,
      username: user.username,
      avatar: getAvatar(user),
      lastfetch: Date.now(),
      email: user.email,
      accesstoken: tokenRes.access_token,
      refreshtoken: tokenRes.refresh_token,
      expires: tokenRes.expires_in * 1000 + Date.now(),
    },
  });
  res.status(200).send({ ...transmittedUserData, token: tokenRes.access_token });
};
