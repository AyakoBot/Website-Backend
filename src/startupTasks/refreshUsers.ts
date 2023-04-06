import Jobs from 'node-schedule';
import DataBase from '../DataBase.js';
import { io, userFetchIOClientIDs } from '../socketIOHandler.js';

const fetch = async () => {
  const res = await DataBase.query(`SELECT * FROM ayakousers;`);

  if (res?.rows) {
    userFetchIOClientIDs.forEach((id) => {
      io.to(id).emit('USER_FETCH', res.rows);
    });
  }
};

setTimeout(() => {
  fetch();
}, 2000);

Jobs.scheduleJob('0 30 * * * *', async () => {
  fetch();
});
