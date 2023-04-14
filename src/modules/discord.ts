import crypto from 'crypto';
import fetch from 'node-fetch';
import auth from '../auth.json' assert { type: 'json' };
import { RawUser } from '../../submodules/Ayako-v1.6/src/Typings/CustomTypings';

/**
 * Code specific to communicating with the Discord API.
 */

/**
 * The following methods all facilitate OAuth2 communication with Discord.
 * See https://discord.com/developers/docs/topics/oauth2 for more details.
 */

/**
 * Generate the url which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
export const getOAuthUrl = (type: 'moderator' | 'owner' | 'support') => {
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

/**
 * Given an OAuth2 code from the scope approval page, make a request to Discord's
 * OAuth2 service to retreive an access token, refresh token, and expiration.
 */
export const getOAuthTokens = async (code: string, type: 'moderator' | 'owner' | 'support') => {
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
  } else {
    throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
  }
};

export type Tokens = {
  expires_at: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
};
/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
export const getAccessToken = async (
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

/**
 * Given a user based access token, fetch profile information for the current user.
 */
export const getUserData = async (tokens: Tokens) => {
  const url = 'https://discord.com/api/v10/oauth2/@me';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
  }
};

export const store = new Map();

export const storeDiscordTokens = (userId: string, tokens: Tokens) => {
  store.set(`discord-${userId}`, tokens);
};

export const getDiscordTokens = (userId: string): Tokens => {
  return store.get(`discord-${userId}`);
};

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

const getAuth = (type: 'moderator' | 'owner' | 'support' | 'circusstaff' | 'circusadmin') => {
  switch (type) {
    case 'moderator': {
      return auth.animekosModerators;
    }
    case 'owner': {
      return auth.animekosOwner;
    }
    case 'support': {
      return auth.ayakoSupport;
    }
    case 'circusstaff': {
      return auth.circusStaff;
    }
    case 'circusadmin': {
      return auth.circusAdmin;
    }
    default: {
      return auth.ayakoOwner;
    }
  }
};

const getName = (type: 'moderator' | 'owner' | 'support' | 'circusstaff' | 'circusadmin') => {
  switch (type) {
    case 'moderator': {
      return 'Animekos Moderator';
    }
    case 'support': {
      return 'Ayako Support';
    }
    case 'owner': {
      return 'Animekos Owner';
    }
    case 'circusstaff': {
      return 'Circus Staff';
    }
    case 'circusadmin': {
      return 'Admin';
    }
    default: {
      return 'Ayako Developer';
    }
  }
};

export const getAvatar = (user: RawUser) => {
  if (!user.avatar) return 'https://cdn.discordapp.com/embed/avatars/1.png';

  if (user.avatar.startsWith('a_')) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`;
  } else return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
};
