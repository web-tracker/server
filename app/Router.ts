import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';
import * as User from './controller/User';

const router = new Router();
router.get('/', (ctx) => {
  ctx.body = 'hi';
});

// OAuth login
router.get('/login', OAuth.loginHandler);
router.get('/callback', OAuth.callbackHandler);

// API
router.get('/user', User.userInfoHandler);

export default router;