import type Express from 'express';
import fetch from 'node-fetch';
import { clients, io } from '../../socketIOHandler.js';

export default async (req: Express.Request, res: Express.Response) => {
  if (!req.body) {
    req.body = { authorization: req.headers.authorization };
  } else {
    req.body.authorization = req.headers.authorization;
  }

  clients.forEach((id) => {
    io.to(id).emit('vote', req.body);
  });

  res.sendStatus(200);

  if (req.body.guild !== '298954459172700181') return;

  delete req.body.authorizeation;

  fetch('https://webhooks.norowa.dev/votes/servers/298954459172700181', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'ifakdyomam',
    },
    body: JSON.stringify(req.body),
  }).catch(console.log);
};
