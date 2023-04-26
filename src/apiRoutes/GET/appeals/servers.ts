import type Express from 'express';
import DataBase from '../../../DataBase.js';
import type * as DBT from '../../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';
import checkAutorized from '../../../modules/checkAutorized.js';
import checkPunishments from '../../../modules/appeals/checkPunishments.js';

export default async (req: Express.Request, res: Express.Response) => {
  const { user, authorized } = await checkAutorized(req, res);
  if (!authorized) return;

  const pun = await checkPunishments(res, user);
  if (!pun.authorized) return;

  const guildIDs = pun.punishments
    .filter(
      (punishment, index, self) =>
        index === self.findIndex((p) => p.guildid === punishment.guildid),
    )
    .map((punishment) => punishment.guildid);

  const guilds = await DataBase.query(
    `SELECT * FROM guilds WHERE guildid IN (${guildIDs.map((_, i) => `$${i + 1}`).join(', ')});`, //;`
    guildIDs,
  ).then((r: { rows: DBT.guilds[] } | null) => (r ? r.rows : null));

  res.json(guilds);
};
