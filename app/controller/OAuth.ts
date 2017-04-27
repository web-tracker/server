// Load configuration file
import * as url from 'url';
import * as crypto from 'crypto';
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
const state = crypto.randomBytes(8).toString('hex');

export function loginHandler(ctx) {
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
  await UserService.register(accessToken);
  Logger.info('Update user profile in database');

  // Mark as logined status
  ctx.session.logined = true;
  ctx.redirect('/dashboard');
}