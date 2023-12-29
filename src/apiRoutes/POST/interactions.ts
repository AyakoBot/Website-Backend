import type Express from 'express';
import nacl from 'tweetnacl';
import DiscordAPI from 'discord-api-types/v10';
import { io, clients } from '../../socketIOHandler.js';
import DataBase from '../../DataBase.js';

export default async (req: Express.Request, res: Express.Response) => {
  const body = req.body as DiscordAPI.APIInteraction;

  const signature = req.get('X-Signature-Ed25519');
  if (!signature) return res.status(400).send('No signature');

  const timestamp = req.get('X-Signature-Timestamp');
  if (!timestamp) return res.status(400).send('No timestamp');

  const guildsettings = await DataBase.guildsettings.findFirst({
    where: { appid: body.application_id },
  });
  if (!guildsettings || !guildsettings.publickey) {
    return res.status(401).send('Invalid Bot Client');
  }

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + (req as unknown as { rawBody: Buffer }).rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(guildsettings.publickey, 'hex'),
  );

  if (!isVerified) return res.status(401).send('Invalid signature');
  if (body.type === DiscordAPI.InteractionType.Ping) return res.status(200).json({ type: 1 });

  clients.map((id) => io.to(id).emit('interaction', body));
  return undefined;
};
