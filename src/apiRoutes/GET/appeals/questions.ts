import type Express from 'express';
import checkAutorized from '../../../modules/checkAutorized.js';
import checkPunishments from '../../../modules/appeals/checkPunishments.js';
import checkAppeals from '../../../modules/appeals/checkAppeals.js';

export default async (req: Express.Request, res: Express.Response) => {
  const { user, authorized } = await checkAutorized(req, res);
  if (!authorized) return;

  const guildid = req.query.guild as string;
  if (!guildid) {
    res.sendStatus(400);
    return;
  }

  const punishmentid = req.query.punishment as string;
  if (!punishmentid) {
    res.sendStatus(400);
    return;
  }

  const pun = await checkPunishments(res, user, guildid);
  if (!pun.authorized) return;

  const appeals = await checkAppeals(res, user, guildid, punishmentid);
  if (!appeals.authorized) return;

  res.json(appeals.questions.reverse());
};
