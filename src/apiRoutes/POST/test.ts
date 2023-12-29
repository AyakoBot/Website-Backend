import type Express from 'express';

export default async (req: Express.Request, res: Express.Response) => {
  console.log(req.body, req.headers, req.params, req.query);
  res.sendStatus(200);
};
