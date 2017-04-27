import * as Koa from 'koa';
import * as Session from 'koa-session-redis3';
import Logger from './Logger';
import router from './Router';

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
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);

Logger.info(`listening on port ${port}`);