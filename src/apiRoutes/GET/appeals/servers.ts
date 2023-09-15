import type Express from 'express';
import DataBase from '../../../DataBase.js';
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

  const guilds = await DataBase.guilds.findMany({ where: { guildid: { in: guildIDs } } });

  res.json(guilds);
};
