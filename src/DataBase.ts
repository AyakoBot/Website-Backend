/* eslint-disable no-console */
import pg from 'pg';
import auth from './auth.json' assert { type: 'json' };

const AyakoDB = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Ayako-v1.5',
  password: auth.psqlPW,
  port: 5432,
});

const CloneDB = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Clone_DB',
  password: auth.psqlPW,
  port: 5432,
});

const connect = (err: Error) => {
  if (err) {
    console.log('Error while logging into DataBase', err.stack);
  }
};

const error = (err: Error) => {
  console.log('Unexpected error on idle pool client', err);
};

AyakoDB.query('SELECT NOW() as now;', (err) => {
  if (err) {
    console.log("| Couldn't connect to DataBase", err.stack);
  } else {
    console.log('| Established Connection to DataBase');
  }
});
CloneDB.query('SELECT NOW() as now;', (err) => {
  if (err) {
    console.log("| Couldn't connect to CloneDB DataBase", err.stack);
  } else {
    console.log('| Established Connection to CloneDB DataBase');
  }
});
AyakoDB.connect(connect);
CloneDB.connect(connect);
AyakoDB.on('error', error);
CloneDB.on('error', error);

export default AyakoDB;
export { CloneDB };
