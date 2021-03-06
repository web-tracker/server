import * as Koa from 'koa';
import * as moment from 'moment';
import * as mysql from 'mysql';
import * as QueryService from '../service/Query';
import { Logger } from '../Logger';
import * as _ from 'lodash';
import { codeResolver } from '../service/CodeResolver';

export async function queryErrorLogs(ctx: Koa.Context) {
  if (!ctx.query) {
    ctx.status = 400;
    ctx.body = { status: 'No query parameters found' };
  }
}

export async function ISPCategory(ctx) {
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }
  ctx.body = await QueryService.SQLQuery(
    `select network_isp from error where site_token=(
        select token from site where belongs_to=? and hostname=?
      ) group by network_isp;`,
    [id, hostname]
  );
}

export async function pathCategory(ctx) {
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }
  ctx.body = await QueryService.SQLQuery(
    `select script_url from error where site_token=(
        select token from site where belongs_to=? and hostname=?
      ) group by script_url`,
    [id, hostname]
  );
}

export async function cityCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }
  ctx.body = await QueryService.SQLQuery(
    `select city from error where site_token=(
        select token from site where belongs_to=? and hostname=?
     ) group by city`,
    [id, hostname]
  );
}

export async function browserCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }
  ctx.body = await QueryService.SQLQuery(
    `select browser from error where site_token=(
        select token from site where belongs_to=? and hostname=?
     ) group by browser`,
    [id, hostname]
  );
}

export async function deviceCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }
  ctx.body = await QueryService.SQLQuery(
    `select device from error where site_token=(
        select token from site where belongs_to=? and hostname=?
     ) group by device`,
    [id, hostname]
  );
}

export async function queryErrors(ctx) {
  const query = ctx.query;
  const id = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!query) {
    ctx.body = {
      status: 'No parameter is provided'
    };
    return;
  }

  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide hostname'
    };
    return;
  }

  let {
    'dateRange[]': dateRange, path, network_isp, city, browser, device
  } = query;

  if (!dateRange || dateRange.length <= 0) {
    dateRange = [
      moment().subtract(30, 'days').format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    ];
  }

  // Increase one day automatically
  // Make the time range inclusive
  dateRange[1] = moment(dateRange[1]).add(1, 'day').format('YYYY-MM-DD');

  // Decode base64
  if (path) path = new Buffer(path, 'base64').toString();

  const conditions: any = {};
  if (path) conditions.script_url = path;
  if (network_isp) conditions.network_isp = network_isp;
  if (browser) conditions.browser = browser;
  if (device) conditions.device = device;
  if (city) conditions.city = city;

  let whereClause: string[] = [];
  for (const [key, value] of _.toPairs(conditions)) {
    whereClause.push(`${key}=${mysql.escape(value)}`);
  }

  try {
    const sql = `select
      message, count(*) as count, script_url, \`column\`, line, stack, time
      from error
      where time >= ? and time <= ? and site_token=(
        select token from site where belongs_to=? and hostname=?
      ) ${whereClause.length > 0 ? ' and ' + whereClause.join(' and ') : ''}
      group by message, script_url
      order by count desc`;
    const psql = mysql.format(sql, [dateRange[0], dateRange[1], id, hostname]);
    Logger.info(psql);

    const queryResults = await QueryService.SQLQuery(sql, [
      dateRange[0], dateRange[1], id, hostname
    ]);
    ctx.body = queryResults;
  } catch (error) {
    Logger.error(error);
    ctx.status = 500;
    ctx.body = { status: 'Server Error' };
  }
}

export async function fetchSourceCode(ctx) {
  if (!ctx.query || !ctx.query.url) {
    ctx.status = 400;
    ctx.body = {
      status: 'Should provide source code url'
    };
    return;
  }
  const codeURL: string = ctx.query.url;
  try {
    const sourceCode = await codeResolver.fetchSourceCode(codeURL);
    if (!sourceCode) {
      throw new Error('Empty result');
    }
    ctx.body = { sourceCode };
  } catch (error) {
    ctx.status = 404;
    ctx.body = {
      status: error
    };
  }
}

export async function decompressSourceCode(ctx) {
  if (ctx.request.method !== 'POST') {
    ctx.status = 400;
    ctx.body = {
      status: 'Please send data via POST'
    };
    return;
  }

  // Here we will get request body in the form of ``
  const { sourcemap, line, column } = ctx.request.body;
  if (!sourcemap || !line || !column) {
    ctx.status = 400;
    ctx.body = {
      status: 'Please provide sourcemap, line and column'
    };
    return;
  }

  const sourceCode = codeResolver.decompressCode(sourcemap, line, column);
  ctx.body = sourceCode;
}
