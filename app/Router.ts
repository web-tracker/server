import * as Router from 'koa-router';
import * as OAuth from './controller/OAuth';

const router = new Router();
router.get('/', (ctx) => {
  ctx.body = 'hi';
});

router.get('/login', OAuth.loginHandler);
router.get('/callback', OAuth.callbackHandler);

export default router;