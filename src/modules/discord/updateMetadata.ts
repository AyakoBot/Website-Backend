import fetch from 'node-fetch';
import { getDiscordTokens } from './discordTokens.js';
import { getAuth, getName } from './getAuthData.js';
import getAccessToken from './getAccessToken.js';

export const updateMetadata = async (
  userId: string,
  type: 'moderator' | 'owner' | 'support' | 'circusstaff' | 'circusadmin',
) => {
  const tokens = getDiscordTokens(userId);
  const used = getAuth(type);

  // GET/PUT /users/@me/applications/:id/role-connection
  const url = `https://discord.com/api/v10/users/@me/applications/${used.id}/role-connection`;
  const accessToken = await getAccessToken(userId, tokens, type);

  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      platform_name: getName(type),
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
  }
};
