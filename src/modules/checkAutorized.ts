import Prisma from '@prisma/client';
import type * as Express from 'express';
import DataBase from '../DataBase.js';

type AuthorizedResponse = {
  authorized: true;
  user: Prisma.users;
};

type UnauthorizedResponse = {
  authorized: false;
  user: undefined;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

export default async (req: Express.Request, res: Express.Response): Promise<ApiResponse> => {
  const token = req.headers.authorization;
  if (!token) {
    res.sendStatus(401);
    return { authorized: false, user: undefined };
  }

  const user = await DataBase.users.findFirst({
    where: { accesstoken: token.replace('Bearer ', '') },
  });

  if (!user) {
    res.sendStatus(401);
    return { authorized: false, user: undefined };
  }

  return { authorized: true, user };
};
