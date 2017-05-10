import * as path from 'path';
import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';
import * as User from './controller/User';
import AuthorizeMiddleware from './AuthorizeMiddleware';
import { resolveRoutes } from './Utils';
import { decompressSourceCode } from './controller/Error';
import { updateWebsite, removeWebsite } from './controller/Website';

const router = new Router();
router.get('/', (ctx) => {
  ctx.body = 'hi';
});

// OAuth login
router.get('/login', OAuth.loginHandler);
router.get('/callback', OAuth.callbackHandler);

// API
router.get('/api/user', AuthorizeMiddleware, User.userInfoHandler);

// Logout doesn't need authorize
router.get('/api/user/logout', User.userLogoutHandler);

// API for Metric
// Todo: add authorize middleware
const metricRoutes = resolveRoutes(path.resolve(__dirname + '/controller/Metric'));
const errorRoutes = resolveRoutes(path.resolve(__dirname + '/controller/Error'));
const websiteRoutes = resolveRoutes(path.resolve(__dirname + '/controller/Website'));

// Register metric api list
router.get('/api/metric', ctx => ctx.body = metricRoutes);
// Register error api list
router.get('/api/error', ctx => ctx.body = errorRoutes);
// Register website api list
router.get('/api/website', ctx => ctx.body = websiteRoutes);

// Register metric api endpoint
for (const route of metricRoutes) {
  router.get('/api/metric/' + route.path, AuthorizeMiddleware, route.module);
}

// Register error api endpoint
for (const route of errorRoutes) {
  router.all('/api/error/' + route.path, AuthorizeMiddleware, route.module);
}

// Register website api endpoint
for (const route of websiteRoutes) {
  router.all('/api/website/' + route.path, AuthorizeMiddleware, route.module);
}
export default router;
