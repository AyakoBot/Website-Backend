import type Express from 'express';
import DataBase from '../../../DataBase.js';
import type * as DBT from '../../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';

export default async (req: Express.Request, res: Express.Response) => {
  const token = req.headers.authorization;
  if (!token) {
    res.sendStatus(401);
    return;
  }

  const user = await DataBase.query('SELECT * FROM users WHERE token = $1;', [
    token.replace('Bearer ', ''),
  ]).then((r: { rows: DBT.users[] } | null) => (r ? r.rows[0] : null));
  if (!user) {
    res.sendStatus(401);
    return;
  }

  const punishments = await DataBase.query(
    `WITH user_punishments AS (
      SELECT guildid, userid, uniquetimestamp FROM punish_bans WHERE userid = $1
      UNION ALL
      SELECT guildid, userid, uniquetimestamp FROM punish_channelbans WHERE userid = $1
      UNION ALL
      SELECT guildid, userid, uniquetimestamp FROM punish_kicks WHERE userid = $1
      UNION ALL
      SELECT guildid, userid, uniquetimestamp FROM punish_mutes WHERE userid = $1
      UNION ALL
      SELECT guildid, userid, uniquetimestamp FROM punish_warns WHERE userid = $1
    )
    SELECT * FROM user_punishments;`,
    [user.userid],
  ).then((r: { rows: { guildid: string; userid: string; uniquetimestamp: string }[] } | null) =>
    r ? r.rows : null,
  );

  if (!punishments) {
    res.json([]);
    return;
  }

  const guildIDs = punishments
    .filter(
      (punishment, index, self) =>
        index === self.findIndex((p) => p.guildid === punishment.guildid),
    )
    .map((punishment) => punishment.guildid);

  const guilds = await DataBase.query(
    `SELECT * FROM guilds WHERE guildid IN (${guildIDs.map((_, i) => `$${i + 1}`).join(', ')});`,
    guildIDs,
  ).then((r: { rows: DBT.guilds[] } | null) => (r ? r.rows : null));

  res.json(guilds);
};
