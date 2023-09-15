import fetch from 'node-fetch';
import type { Tokens } from '../../Typings/CustomTypings';

export default async (tokens: Tokens) => {
  const url = 'https://discord.com/api/v10/oauth2/@me';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
};
