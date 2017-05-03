import * as path from 'path';
import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';
import * as User from './controller/User';
import AuthorizeMiddleware from './AuthorizeMiddleware';
import { resolveRoutes } from './Utils';

const router = new Router();
router.get('/', (ctx) => {
  ctx.body = 'hi';
});

// OAuth login
router.get('/login', OAuth.loginHandler);
router.get('/callback', OAuth.callbackHandler);

// API
router.get('/api/user', AuthorizeMiddleware, User.userInfoHandler);
router.get('/api/user/logout', AuthorizeMiddleware, User.userLogoutHandler);

// API for Metric
// Todo: add authorize middleware
const metricRoutes = resolveRoutes(path.resolve(__dirname + '/controller/Metric'));

// Register metric api list
router.get('/api/metric', ctx => ctx.body = metricRoutes);

// Register metric api endpoint
for (const route of metricRoutes) {
  console.log(route.path, route.module);
  router.get('/api/metric/' + route.path, route.module);
}

export default router;