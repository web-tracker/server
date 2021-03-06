import * as path from 'path';
import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';
import * as User from './controller/User';
import AuthorizeMiddleware from './AuthorizeMiddleware';
import { resolveRoutes } from './Utils';
import { decompressSourceCode } from './controller/Error';
import { updateWebsite, removeWebsite } from './controller/Website';
import { SDKHandler } from './controller/DevKit';

const router = new Router();

// Register SDK for customers
router.get('/sdk.js', SDKHandler);

// Dashboard API endpoint
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
const alertRoutes = resolveRoutes(path.resolve(__dirname + '/controller/Alert'));

// Register metric api list
router.get('/api/metric', ctx => ctx.body = metricRoutes);
// Register error api list
router.get('/api/error', ctx => ctx.body = errorRoutes);
// Register website api list
router.get('/api/website', ctx => ctx.body = websiteRoutes);
// Register alert api list
router.get('/api/alert', ctx => ctx.body = alertRoutes);

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

// Register alert api endpoint
for (const route of alertRoutes) {
  router.all('/api/alert/' + route.path, AuthorizeMiddleware, route.module);
}

export default router;
