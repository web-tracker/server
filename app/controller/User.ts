import * as UserService from '../service/User';

export async function userInfoHandler(ctx) {
  // No logined
  if (!ctx.session.userId || ctx.session.userId.length <= 0) {
    ctx.status = 403;
    ctx.body = { status: 'Unauthorized' };
    return;
  }
  const userId = ctx.session.userId;
  const user = await UserService.query(userId);
  ctx.body = user;
}