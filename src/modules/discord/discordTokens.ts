import type { Tokens } from '../../Typings/CustomTypings';

export const store = new Map();

export const storeDiscordTokens = (userId: string, tokens: Tokens) => {
  store.set(`discord-${userId}`, tokens);
};

export const getDiscordTokens = (userId: string): Tokens => {
  return store.get(`discord-${userId}`);
};
