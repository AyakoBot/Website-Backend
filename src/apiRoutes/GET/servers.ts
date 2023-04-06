import type Express from 'express';
import { servers } from '../../modules/cache.js';

export default async (_: Express.Request, res: Express.Response) => {
  res.json(servers);
};
