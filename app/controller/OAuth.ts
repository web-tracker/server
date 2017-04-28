import * as url from 'url';
import * as querystring from 'querystring';
import Logger from '../Logger';
import * as config from '../../config';
import * as UserService from '../service/User';
import requestGet from '../Utils';

const OAuthConfig = {
  client: config.github.client,
  secret: config.github.secret,
  baseURL: config.github.baseURL,
  loginURI: '/login',
  callbackURI: '/callback',
  scope: 'user'
};

const authorizeUrl = 'https://github.com/login/oauth/authorize';
const acessTokenUrl = 'https://github.com/login/oauth/access_token';
const redirectUrl = url.resolve(OAuthConfig.baseURL, OAuthConfig.callbackURI);
// const state = crypto.randomBytes(8).toString('hex');

export function loginHandler(ctx) {
  const state = ctx.query.redirect_url;
  if (!state) {
    ctx.body = 'Error';
    return;
  }
  if (ctx.session.logined) {
    ctx.redirect('/dashboard');
    return;
  }
  const queries = querystring.stringify({
    client_id: OAuthConfig.client,
    scope: OAuthConfig.scope,
    redirect_uri: redirectUrl,
    state: state
  });
  const loginUrl = `${authorizeUrl}?${queries}`;
  ctx.status = 302;
  ctx.set('location', loginUrl);
}

export async function callbackHandler(ctx) {
  const code = ctx.query.code;
  const state = ctx.query.state;
  if (!code) {
    ctx.body = 'Error';
  }
  const queries = querystring.stringify({
    client_id: OAuthConfig.client,
    client_secret: OAuthConfig.secret,
    code: code,
    state: state
  });
  const tokenUrl = `${acessTokenUrl}?${queries}`;
  const body = await requestGet({ url: tokenUrl, json: true });
  const accessToken = body.access_token;
  const user = await UserService.register(accessToken);
  Logger.info('Update user profile in database');

  // Mark as logined status
  if (user) ctx.session.userId = user.id;
  ctx.redirect(state);
}