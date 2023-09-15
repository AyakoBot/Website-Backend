import Prisma from '@prisma/client';
import Express from 'express';
import DataBase from '../../DataBase.js';

type Punishment =
  | Prisma.punish_kicks
  | Prisma.punish_bans
  | Prisma.punish_mutes
  | Prisma.punish_warns
  | Prisma.punish_channelbans;

type PunishmentWithType = Punishment & {
  type: 'kick' | 'ban' | 'mute' | 'warn' | 'channelban';
};

type AuthorizedResponse = {
  authorized: true;
  punishments: PunishmentWithType[];
};

type UnauthorizedResponse = {
  authorized: false;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

export default async (
  res: Express.Response,
  user: Prisma.users,
  guildid?: string,
): Promise<ApiResponse> => {
  const where = {
    where: { userid: user.userid, guildid },
  };

  const kicks = await DataBase.punish_kicks
    .findMany(where)
    .then((r) => r.map((v) => ({ ...v, type: 'kick' })));
  const bans = await DataBase.punish_bans
    .findMany(where)
    .then((r) => r.map((v) => ({ ...v, type: 'ban' })));
  const mutes = await DataBase.punish_mutes
    .findMany(where)
    .then((r) => r.map((v) => ({ ...v, type: 'mute' })));
  const warns = await DataBase.punish_warns
    .findMany(where)
    .then((r) => r.map((v) => ({ ...v, type: 'warn' })));
  const channelbans = await DataBase.punish_channelbans
    .findMany(where)
    .then((r) => r.map((v) => ({ ...v, type: 'channelban' })));

  const punishments = [
    ...kicks,
    ...bans,
    ...mutes,
    ...warns,
    ...channelbans,
  ] as PunishmentWithType[];

  if (!punishments) {
    if (guildid) res.sendStatus(403);
    else res.json([]);

    return { authorized: false };
  }

  return { authorized: true, punishments };
};
