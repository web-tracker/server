import * as UserService from '../service/User';

export async function userInfoHandler(ctx) {
  const userId = ctx.session.userId;
  const user = await UserService.query(userId);
  ctx.body = user;
}

export async function userLogoutHandler(ctx) {
  // Reset userId to logout
  ctx.session.userId = null;
  ctx.body = { status: 'success' };
}