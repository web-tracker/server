import * as Koa from 'koa';
import * as QueryService from '../service/Query';

export async function queryErrorLogs(ctx: Koa.Context) {
  if (!ctx.query) {
    ctx.status = 400;
    ctx.body = { status: 'No query parameters found' };
  }
  // select message, count(*) as count, script_url, `column`, line from error group by message order by count desc
}

export async function ISPCategory(ctx) {
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select network_isp from error where site_token=(
        select token from site where belongs_to=?
      ) group by network_isp;`,
    id
  );
}

export async function pathCategory(ctx) {
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select page_url from error where site_token=(
        select token from site where belongs_to=?
      ) group by page_url`,
    id
  );
}

export async function cityCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select city from error where site_token=(
        select token from site where belongs_to=?
     ) group by city`,
    id
  );
}

export async function browserCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select browser from error where site_token=(
        select token from site where belongs_to=?
     ) group by browser`,
    id
  );
}

export async function deviceCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select device from error where site_token=(
        select token from site where belongs_to=?
     ) group by device`,
    id
  );
}