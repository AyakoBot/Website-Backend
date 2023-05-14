import fetch from 'node-fetch';
import { storeDiscordTokens } from './discordTokens.js';
import type { Tokens } from '../../Typings/CustomTypings';
import { getAuth } from './getAuthData.js';
import * as DBT from '../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings';

export default async (
  userId: string,
  tokens: DBT.users,
  type:
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
    | 'nr-helper',
) => {
  const used = getAuth(type);

  if (Date.now() > Number(tokens.expires)) {
    const url = 'https://discord.com/api/v10/oauth2/token';
    const body = new URLSearchParams({
      client_id: used.id,
      client_secret: used.secret,
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshtoken as string,
    });
    const response = await fetch(url, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.ok) {
      const t = (await response.json()) as Tokens;
      t.expires_at = Number(tokens.expires);
      storeDiscordTokens(userId, t);
      return t.access_token;
    }
    throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
  }
  return tokens.accesstoken;
};
