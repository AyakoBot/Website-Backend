import Jobs from 'node-schedule';
import { io, serverFetchIOClientIDs } from '../socketIOHandler.js';

const fetch = async () => {
  serverFetchIOClientIDs.forEach((id) => {
    io.to(id).emit('SERVER_FETCH');
  });
};

setTimeout(() => {
  fetch();
}, 2000);

Jobs.scheduleJob('0 30 * * * *', async () => {
  fetch();
});
