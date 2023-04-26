import type * as Express from 'express';
import DataBase from '../DataBase.js';
import type * as DBT from '../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';

type AuthorizedResponse = {
  authorized: true;
  user: DBT.users;
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

  const user = await DataBase.query('SELECT * FROM users WHERE token = $1;', [
    token.replace('Bearer ', ''),
  ]).then((r: { rows: DBT.users[] } | null) => (r ? r.rows[0] : null));
  if (!user) {
    res.sendStatus(401);
    return { authorized: false, user: undefined };
  }

  return { authorized: true, user };
};
