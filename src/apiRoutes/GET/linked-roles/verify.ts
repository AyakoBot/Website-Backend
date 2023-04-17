import type Express from 'express';
import { getOAuthURL } from '../../../modules/discord/getOAuth.js';

export default async (req: Express.Request, res: Express.Response) => {
  const type = req.query.type as 'moderator' | 'owner';
  const { url, state } = getOAuthURL(type);

  // Store the signed state param in the user's cookies so we can verify
  // the value later. See:
  // https://discord.com/developers/docs/topics/oauth2#state-and-security
  res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

  // Send the user to the Discord owned OAuth2 authorization endpoint
  res.redirect(url);
};
