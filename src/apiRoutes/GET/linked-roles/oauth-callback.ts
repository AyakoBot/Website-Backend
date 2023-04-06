import type Express from 'express';
import * as discord from '../../../modules/discord.js';

export default async (req: Express.Request, res: Express.Response) => {
  const { code, type } = req.query;
  const discordState = req.query.state;

  const { clientState } = req.signedCookies;
  if (clientState !== discordState) {
    res.sendStatus(403);
    return;
  }

  const tokens = (await discord.getOAuthTokens(
    code as string,
    type as 'owner' | 'moderator',
  )) as discord.Tokens;
  const meData = await discord.getUserData(tokens);
  const userId = (meData as { user: { id: string } }).user.id;

  switch (type) {
    case 'moderator': {
      if (
        ![
          '919696187408384001',
          '725925162549248091',
          '318453143476371456',
          '564052925828038658',
          '267835618032222209',
        ].includes(userId)
      ) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'owner': {
      if (!['267835618032222209'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'support': {
      if (!['853273522758484060', '318453143476371456'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'circusadmin': {
      if (!['644499594348331009', '843976133732991006', '812052724896104470'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'circusstaff': {
      if (
        ![
          '644499594348331009',
          '994023908007219302',
          '548578804822573056',
          '1024849519273324595',
          '276378789397790720',
          '812052724896104470',
          '843976133732991006',
        ].includes(userId)
      ) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    default: {
      res.sendStatus(401);
      return;
    }
  }

  discord.storeDiscordTokens(userId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    expires_in: tokens.expires_in,
  });

  discord.updateMetadata(userId, type);

  res.send(
    'Thank you for verifying! Go back to Discord, click on Linked Roles and do the same as before.',
  );
};
