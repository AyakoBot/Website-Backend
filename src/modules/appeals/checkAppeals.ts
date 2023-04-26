import Express from 'express';
import DataBase from '../../DataBase.js';
import type * as DBT from '../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';

type AuthorizedResponse = {
  authorized: true;
  questions: DBT.appealquestions[];
};

type UnauthorizedResponse = {
  authorized: false;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

export default async (
  res: Express.Response,
  user: DBT.users,
  guildid: string,
  punishmentid: string,
): Promise<ApiResponse> => {
  const appealsettings = await DataBase.query(
    `SELECT * FROM appealsettings WHERE guildid = $1 AND active = true AND channelid IS NOT NULL;`,
    [guildid],
  ).then((r: { rows: DBT.appealsettings[] } | null) => (r ? r.rows[0] : null));

  if (!appealsettings || appealsettings.blusers?.includes(user.userid)) {
    res.sendStatus(403);
    return { authorized: false };
  }

  const questions = await DataBase.query(
    `SELECT * FROM appealquestions WHERE guildid = $1 AND active = true;`,
    [guildid],
  ).then((r: { rows: DBT.appealquestions[] } | null) => (r ? r.rows : null));

  if (!questions) {
    res.sendStatus(403);
    return { authorized: false };
  }

  const appeals = await DataBase.query(
    `SELECT * FROM appeals WHERE guildid = $1 AND userid = $2 AND punishmentid = $3;`,
    [guildid, user.userid, punishmentid],
  ).then((r: { rows: DBT.appeals[] } | null) => (r ? r.rows[0] : null));
  if (appeals) {
    res.json({ hasAppealed: true });
    return { authorized: false };
  }

  return { authorized: true, questions };
};
