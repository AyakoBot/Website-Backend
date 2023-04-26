import Express from 'express';
import fs from 'fs';

export default async (_: Express.Request, res: Express.Response) => {
  const robots = fs.readFileSync('../Website-CDN/website_assets/robots.txt', 'utf8');
  res.send(robots);
};
