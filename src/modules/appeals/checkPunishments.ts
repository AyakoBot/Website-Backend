import Express from 'express';
import DataBase from '../../DataBase.js';
import type * as DBT from '../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';

type AuthorizedResponse = {
  authorized: true;
  punishments: {
    guildid: string;
    reason: string;
    channelname: string;
    channelid: string;
    uniquetimestamp: string;
    type: 'ban' | 'channelban' | 'kick' | 'mute' | 'warn';
  }[];
};

type UnauthorizedResponse = {
  authorized: false;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

export default async (
  res: Express.Response,
  user: DBT.users,
  guildid?: string,
): Promise<ApiResponse> => {
  const punishments = await DataBase.query(
    `WITH user_punishments AS (
      SELECT guildid, reason, channelname, channelid, uniquetimestamp, 'ban' as type FROM punish_bans WHERE userid = $1 ${
        guildid ? 'AND guildid = $2' : ''
      }
      UNION ALL
      SELECT guildid, reason, channelname, channelid, uniquetimestamp, 'channelban' as type FROM punish_channelbans WHERE userid = $1 ${
        guildid ? 'AND guildid = $2' : ''
      }
      UNION ALL
      SELECT guildid, reason, channelname, channelid, uniquetimestamp, 'kick' as type FROM punish_kicks WHERE userid = $1 ${
        guildid ? 'AND guildid = $2' : ''
      }
      UNION ALL
      SELECT guildid, reason, channelname, channelid, uniquetimestamp, 'mute' as type FROM punish_mutes WHERE userid = $1 ${
        guildid ? 'AND guildid = $2' : ''
      }
      UNION ALL
      SELECT guildid, reason, channelname, channelid, uniquetimestamp, 'warn' as type FROM punish_warns WHERE userid = $1 ${
        guildid ? 'AND guildid = $2' : ''
      }
    )
    SELECT * FROM user_punishments;`,
    guildid ? [user.userid, guildid] : [user.userid],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).then((r: { rows: any[] } | null) => (r ? r.rows : null));

  if (!punishments) {
    if (guildid) res.sendStatus(403);
    else res.json([]);

    return { authorized: false };
  }

  return { authorized: true, punishments };
};
