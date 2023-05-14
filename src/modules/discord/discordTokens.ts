import type { Tokens } from '../../Typings/CustomTypings';
import DataBase from '../../DataBase.js';
import * as DBT from '../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings';

export const store = new Map();

export const storeDiscordTokens = (userId: string, tokens: Tokens) =>
  DataBase.query(
    `INSERT INTO users (accesstoken, refreshtoken, expires, userid) VALUES ($1, $2, $3, $4) ON CONFLICT (userid) DO UPDATE SET accesstoken = $1, refreshtoken = $2, expires = $3;`,
    [tokens.access_token, tokens.refresh_token, tokens.expires_at, userId],
  );

export const getDiscordTokens = async (userId: string): Promise<DBT.users | undefined> =>
  DataBase.query(`SELECT * FROM users WHERE userid = $1;`, [userId]).then(
    (res: { rows: DBT.users[] } | null) => res?.rows[0],
  );
