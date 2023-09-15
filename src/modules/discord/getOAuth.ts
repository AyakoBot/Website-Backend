import crypto from 'crypto';
import fetch from 'node-fetch';
import { getAuth } from './getAuthData.js';

export const getOAuthTokens = async (
  code: string,
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
  const url = 'https://discord.com/api/v10/oauth2/token';
  const used = getAuth(type);

  const body = new URLSearchParams({
    client_id: used.id,
    client_secret: used.secret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: used.redirectURI,
  });

  const response = await fetch(url, {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  }

  throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
};

export const getOAuthURL = (type: never) => {
  const state = crypto.randomUUID();
  const used = getAuth(type);

  const url = new URL('https://discord.com/api/oauth2/authorize');
  url.searchParams.set('client_id', used.id);
  url.searchParams.set('redirect_uri', used.redirectURI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  url.searchParams.set('scope', 'role_connections.write identify');
  url.searchParams.set('prompt', 'consent');
  return { state, url: url.toString() };
};
