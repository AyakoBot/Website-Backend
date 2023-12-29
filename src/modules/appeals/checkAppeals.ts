import Prisma from '@prisma/client';
import Express from 'express';
import DataBase from '../../DataBase.js';

type AuthorizedResponse = {
  authorized: true;
  questions: Prisma.appealquestions[];
};

type UnauthorizedResponse = {
  authorized: false;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

export default async (
  res: Express.Response,
  user: Prisma.users,
  guildid: string,
  punishmentid: string,
): Promise<ApiResponse> => {
  const appealsettings = await DataBase.appealsettings.findUnique({
    where: { guildid, active: true, channelid: { not: null } },
  });

  if (!appealsettings || appealsettings.bluserid?.includes(user.userid)) {
    res.sendStatus(403);
    return { authorized: false };
  }

  const questions = await DataBase.appealquestions.findMany({
    where: { guildid, active: true },
  });

  if (!questions) {
    res.sendStatus(403);
    return { authorized: false };
  }

  const appeals = await DataBase.appeals.findFirst({
    where: { guildid, userid: user.userid, punishmentid },
  });

  if (appeals) {
    res.json({ hasAppealed: true });
    return { authorized: false };
  }

  return { authorized: true, questions };
};
