import type Express from 'express';
import fetch from 'node-fetch';
import DataBase from '../../DataBase.js';

export default async (req: Express.Request, res: Express.Response) => {
  const token = req.headers.authorization;
  if (!token || token === 'undefined') {
    res.sendStatus(401);
    return;
  }

  const dRes = await fetch('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
  });

  if (!dRes.body) {
    res.sendStatus(401);
    return;
  }

  const userData = (await dRes.json()) as {
    id: string;
    username: string;
    discriminator: string;
    email: string;
    avatar: string;
  };

  if (!userData.id) {
    res.sendStatus(401);
    return;
  }

  res.sendStatus(200);

  const avatar = `${
    userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${
          userData.avatar?.startsWith('a_') ? '.gif' : '.png'
        }`
      : 'https://cdn.discordapp.com/embed/avatars/1.png'
  }`;

  DataBase.users
    .upsert({
      where: { userid: userData.id },
      update: {
        username: `${userData.username}#${userData.discriminator}`,
        avatar,
        lastfetch: Date.now(),
        email: userData.email,
      },
      create: {
        userid: userData.id,
        username: `${userData.username}#${userData.discriminator}`,
        avatar: `${
          userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${
                userData.avatar?.startsWith('a_') ? '.gif' : '.png'
              }`
            : 'https://cdn.discordapp.com/embed/avatars/1.png'
        }`,
        lastfetch: Date.now(),
        email: userData.email,
      },
    })
    .then();
};
