import * as SocketIO from 'socket.io';
import auth from './auth.json' assert { type: 'json' };
import { server } from './server.js';

export const topgg: string[] = [];
export const appeal: string[] = [];

const clients = {
  topgg,
  appeal,
};

export const io = new SocketIO.Server(server);

io.on('connection', (client) => {
  const reason = client.handshake.auth.reason as keyof typeof clients;

  if (client.handshake.auth.code !== auth.socketToken) return;
  if (!reason) return;
  if (!clients[reason]) return;

  clients[reason].push(client.id);
  removeListener(reason, client);
});

const removeListener = (type: keyof typeof clients, client: SocketIO.Socket) => {
  client.on('disconnect', () => clients[type].splice(clients[type].indexOf(client.id), 1));
};
