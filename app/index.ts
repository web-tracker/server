import * as path from 'path';
import * as childProcess from 'child_process';
import * as Koa from 'koa';
import * as cors from 'kcors';
import * as bodyParser from 'koa-bodyparser';
import * as Session from 'koa-session-redis3';
import Logger from './Logger';
import router from './Router';

// Spawn several workers
// const perfWorkerPath = path.join(__dirname, '../worker.js');
// const worker = childProcess.fork(perfWorkerPath);

// worker.on('exit', code => {
//   Logger.info('Worker process exit', code);
// });

// process.on('exit', () => {
//   worker.kill();
// });

// Logger.info('Worker pid:', worker.pid);

const port = 8080;
const app = new Koa();

app.keys = ['webtracker'];
app.use(Session({
  store: {
    host: '127.0.0.1',
    port: 6379,
    ttl: 3600
  }
}));

// Allow cross origin
app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);

Logger.info(`listening on port ${port}`);
