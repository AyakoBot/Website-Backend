import type Express from 'express';
import { io, clients } from '../../socketIOHandler.js';

export default async (req: Express.Request, res: Express.Response) => {
  if (!req.body) {
    req.body = { authorization: req.headers.authorization };
  } else {
    req.body.authorization = req.headers.authorization;
  }

  clients.forEach((id) => {
    io.to(id).emit('topgg', req.body);
  });

  res.sendStatus(200);
};
