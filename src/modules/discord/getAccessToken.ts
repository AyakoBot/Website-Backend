import fetch from 'node-fetch';
import { getAuth } from './getAuthData.js';
import { Tokens } from '../../Typings/CustomTypings';

export default async (
  tokens: Tokens,
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

  const url = 'https://discord.com/api/v10/oauth2/token';
  const body = new URLSearchParams({
    client_id: used.id,
    client_secret: used.secret,
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token as string,
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
    t.expires_at = Number(tokens.expires_at);
    console.log('got access token', tokens);
    return t.access_token;
  }
  throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
};
