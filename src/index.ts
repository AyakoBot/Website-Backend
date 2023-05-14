import readline from 'readline';
import './socketIOHandler.js';
import './DataBase.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg) => {
  if (msg === 'restart') process.exit();
  // eslint-disable-next-line no-console
  console.log(
    msg.includes('await') || msg.includes('return')
      ? // eslint-disable-next-line no-eval
        await eval(`(async () => {${msg}})()`)
      : // eslint-disable-next-line no-eval
        eval(msg),
  );
});

// eslint-disable-next-line no-console
console.log('Website Started');

// eslint-disable-next-line no-console
process.on('uncaughtException', console.error);
// eslint-disable-next-line no-console
process.on('unhandledRejection', console.error);
