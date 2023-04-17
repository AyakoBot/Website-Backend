import { storeDiscordTokens } from './discordTokens.js';
import fetch from 'node-fetch';
import type { Tokens } from '../../Typings/CustomTypings';
import { getAuth } from './getAuthData.js';

export default async (
  userId: string,
  tokens: Tokens,
  type: 'moderator' | 'owner' | 'support' | 'circusstaff' | 'circusadmin',
) => {
  const used = getAuth(type);

  if (Date.now() > tokens.expires_at) {
    const url = 'https://discord.com/api/v10/oauth2/token';
    const body = new URLSearchParams({
      client_id: used.id,
      client_secret: used.secret,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    });
    const response = await fetch(url, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.ok) {
      const tokens = (await response.json()) as Tokens;
      tokens.access_token = tokens.access_token;
      tokens.expires_at = Date.now() + tokens.expires_in * 1000;
      storeDiscordTokens(userId, tokens);
      return tokens.access_token;
    } else {
      throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
    }
  }
  return tokens.access_token;
};
