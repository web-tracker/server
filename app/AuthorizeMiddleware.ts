import Logger from './Logger';

export default async function AuthorizeMiddleware(ctx, next) {
  // Not logined
  if (!ctx.session.userId || ctx.session.userId.length <= 0) {
    ctx.status = 403;
    ctx.body = { status: 'Unauthorized' };
    Logger.error('Authorize Middleware: not logined');
    return;
  } else {
    await next();
  }
}