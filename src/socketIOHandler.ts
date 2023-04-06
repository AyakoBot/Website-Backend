import * as SocketIO from 'socket.io';
import auth from './auth.json' assert { type: 'json' };
import { server } from './server.js';
import DataBase from './DataBase.js';
import { servers } from './modules/cache.js';

export const willisIOClientIDs: string[] = [];
export const topGGIOClientIDs: string[] = [];
export const userFetchIOClientIDs: string[] = [];
export const serverFetchIOClientIDs: string[] = [];

const clients = {
  willisIOClientIDs,
  topGGIOClientIDs,
  userFetchIOClientIDs,
  serverFetchIOClientIDs,
};

export const io = new SocketIO.Server(server);

io.on('connection', (client) => {
  switch (client.handshake.auth.reason) {
    case 'willis_dashboard': {
      willisIOClientIDs.push(client.id);
      removeListener('willisIOClientIDs', client);
      break;
    }
    case 'top_gg_votes': {
      if (client.handshake.auth.code !== auth.socketToken) return;
      topGGIOClientIDs.push(client.id);
      removeListener('topGGIOClientIDs', client);
      break;
    }
    case 'userfetching': {
      if (client.handshake.auth.code !== auth.socketToken) return;
      userFetchIOClientIDs.push(client.id);
      handleEvent('userFetchIOClientIDs', client);
      removeListener('userFetchIOClientIDs', client);
      break;
    }
    case 'serverfetching': {
      if (client.handshake.auth.code !== auth.socketToken) return;
      serverFetchIOClientIDs.push(client.id);
      handleEvent('serverFetchIOClientIDs', client);
      removeListener('serverFetchIOClientIDs', client);
      break;
    }
    default: {
      break;
    }
  }
});

const removeListener = (type: keyof typeof clients, client: SocketIO.Socket) => {
  client.on('disconnect', () => clients[type].splice(clients[type].indexOf(client.id), 1));
};

const handleEvent = (
  type: 'serverFetchIOClientIDs' | 'userFetchIOClientIDs',
  client: SocketIO.Socket,
) => {
  switch (type) {
    case 'userFetchIOClientIDs': {
      client.on(
        'USERS_FETCHED',
        (users: { id: string; discriminator: string; username: string; avatar: string }[]) => {
          users.forEach((u, i) => {
            setTimeout(() => {
              if (!u) return;

              DataBase.query(
                `UPDATE ayakousers SET username = $1, avatar = $2, lastfetch = $3 WHERE userid = $4;`,
                [
                  `${u?.username || 'Deleted User'}#${u?.discriminator || '0000'}`,
                  u?.avatar
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                        u.avatar?.startsWith('a_') ? 'gif' : 'png'
                      }`
                    : 'https://cdn.discordapp.com/embed/avatars/1.png',
                  Date.now(),
                  u.id,
                ],
              );
            }, i * 100);

            setTimeout(() => {
              DataBase.query(
                `UPDATE ayakousers SET username = $1, avatar = $2, lastfetch = $3 WHERE username IS NULL;`,
                ['Deleted User', 'https://cdn.discordapp.com/embed/avatars/1.png', Date.now()],
              );
            }, users.length * 100);
          });
        },
      );
      break;
    }
    case 'serverFetchIOClientIDs': {
      client.on(
        'SERVERS_FETCHED',
        (data: {
          count: number;
          users: number;
          servers: {
            invite?: string;
            name: string;
            iconURL: string;
            members: number;
            bannerURL?: string;
          }[];
        }) => {
          servers.servers = data.servers;
          servers.count = data.count;
          servers.users = data.users;
        },
      );
      break;
    }
    default: {
      break;
    }
  }
};
