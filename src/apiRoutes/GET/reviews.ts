import type Express from 'express';
import DataBase from '../../DataBase.js';

export default async (_: Express.Request, res: Express.Response) => {
  const reviews = await DataBase.reviews.findMany();

  if (!reviews) {
    res.sendStatus(500);
    return;
  }

  res.json(reviews);
};
