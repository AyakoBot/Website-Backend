import * as SocketIO from 'socket.io';
import auth from './auth.json' assert { type: 'json' };
import { server } from './server.js';

export const topGGIOClientIDs: string[] = [];

const clients = {
  topGGIOClientIDs,
};

export const io = new SocketIO.Server(server);

io.on('connection', (client) => {
  switch (client.handshake.auth.reason) {
    case 'top_gg_votes': {
      if (client.handshake.auth.code !== auth.socketToken) return;
      topGGIOClientIDs.push(client.id);
      removeListener('topGGIOClientIDs', client);
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
