import * as SocketIO from 'socket.io';
import auth from './auth.json' assert { type: 'json' };
import { server } from './server.js';

export const clients: string[] = [];
export const io = new SocketIO.Server(server);

io.on('connection', (client) => {
  if (client.handshake.auth.reason !== 'botClient') return;
  if (client.handshake.auth.code !== auth.socketToken) return;

  clients.push(client.id);
  removeListener(client);
});

const removeListener = (client: SocketIO.Socket) =>
  client.on('disconnect', () => clients.splice(clients.indexOf(client.id), 1));
