import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';
import * as User from './controller/User';
import AuthorizeMiddleware from './AuthorizeMiddleware';

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


export default router;