import type Express from 'express';
import { getOAuthTokens } from '../../../modules/discord/getOAuth.js';
import type { Tokens } from '../../../Typings/CustomTypings.js';
import getUserData from '../../../modules/discord/getUserData.js';
import { storeDiscordTokens } from '../../../modules/discord/discordTokens.js';
import { updateMetadata } from '../../../modules/discord/updateMetadata.js';

type acceptedType =
  | 'moderator'
  | 'owner'
  | 'support'
  | 'circusstaff'
  | 'circusadmin'
  | 'helper'
  | 'nr-owner'
  | 'nr-coowner'
  | 'nr-management'
  | 'nr-staff'
  | 'nr-helper';

export default async (req: Express.Request, res: Express.Response) => {
  const { code, type } = req.query;
  const discordState = req.query.state;

  const { clientState } = req.signedCookies;
  if (clientState !== discordState) {
    res.sendStatus(403);
    return;
  }

  const tokens = (await getOAuthTokens(code as string, type as acceptedType)) as Tokens;
  const meData = await getUserData(tokens);
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
    case 'helper': {
      if (!['1012714899438321796', '984344871445860423', '318453143476371456'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'nr-owner': {
      if (!['716609535615172629'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'nr-coowner': {
      if (!['397785248500547586', '792072784427614258'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'nr-management': {
      if (!['799927212983582750', '175820155832631297'].includes(userId)) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'nr-staff': {
      if (
        ![
          '391398540594905089',
          '395401839685664769',
          '394968353464385536',
          '661164104593047552',
        ].includes(userId)
      ) {
        res.sendStatus(401);
        return;
      }
      break;
    }
    case 'nr-helper': {
      if (!['296059416162074624', '104787569098637312', '346799534283816960'].includes(userId)) {
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

  storeDiscordTokens(userId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    expires_in: tokens.expires_in,
  });

  updateMetadata(userId, type);

  res.send(
    'Thank you for verifying! Go back to Discord, click on Linked Roles and do the same as before.',
  );
};
