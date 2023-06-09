import type Express from 'express';
import checkAutorized from '../../../modules/checkAutorized.js';
import checkPunishments from '../../../modules/appeals/checkPunishments.js';

export default async (req: Express.Request, res: Express.Response) => {
  const { user, authorized } = await checkAutorized(req, res);
  if (!authorized) return;

  const guildid = req.query.guild as string;
  if (!guildid) {
    res.sendStatus(400);
    return;
  }

  const pun = await checkPunishments(res, user, guildid);
  if (!pun.authorized) return;

  res.json(pun.punishments);
};
