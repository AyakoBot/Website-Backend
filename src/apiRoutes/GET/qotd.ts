import type Express from 'express';
import { rando } from '@nastyox/rando.js';
import questions from '../../modules/qotd.js';

export default async (_req: Express.Request, res: Express.Response) => {
  const question = questions[rando(questions.length)];

  res.json({ question });
};
