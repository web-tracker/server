import * as mysql from 'mysql';
import * as moment from 'moment';
import * as MetricService from '../service/Metric';
import * as QueryService from '../service/Query';
import { normalizePercentage } from '../Utils';
import Logger from '../Logger';

/**
 * Compute the overhead of average loading time.
 * TODO: Should judge which user and which website
 */
export async function averageLoadingTimeOverhead(ctx) {
  let todayLoadingTime = await MetricService.getCurrentAverageTotalLoadingTime();
  const pastLoadingTime = await MetricService.getHistoryAverageTotalLoadingTime();
  if (isNaN(todayLoadingTime)) {
    todayLoadingTime = pastLoadingTime;
  }
  ctx.body = {
    averageLoadingTimeOverhead: normalizePercentage(
      ((todayLoadingTime - pastLoadingTime) / pastLoadingTime) * 10
    )
  };
}

export async function historyTotalLoadingTime$days(ctx) {
  const daysAgo = parseInt(ctx.params.days);
  if (isNaN(daysAgo)) {
    ctx.body = { status: 'Param format error' };
    return;
  }
  ctx.body = await MetricService.getHistoryTotalLoadingTime(daysAgo);
}

export async function averageFirstPaintTimeOverhead(ctx) {
  let todayPaintTime = await MetricService.getCurrentAverageFirstPaintTime();
  const pastPaintTime = await MetricService.getHistoryAverageFirstPaintTime();
  // No data for now
  if (isNaN(todayPaintTime)) {
    todayPaintTime = pastPaintTime;
  }
  ctx.body = {
    averageFirstPaintTimeOverhead: normalizePercentage(
      ((todayPaintTime - pastPaintTime) / pastPaintTime) * 10
    )
  };
}

export async function historyFirstPaintTime$days(ctx) {
  const daysAgo = parseInt(ctx.params.days);
  if (isNaN(daysAgo)) {
    ctx.body = { status: 'Param format error' };
    return;
  }
  ctx.body = await MetricService.getHistoryFirstPaintTime(daysAgo);
}

export async function historyMetricOverview$days(ctx) {
  const daysAgo = parseInt(ctx.params.days);
  if (isNaN(daysAgo)) {
    ctx.body = { status: 'Param format error' };
    return;
  }
  ctx.body = await MetricService.getMetricOverview(daysAgo);
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
    `select network_isp from metric where site_token=(
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
    `select page_url from metric where site_token=(
        select token from site where belongs_to=? and hostname=?
      ) group by page_url`,
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
    `select city from metric where site_token=(
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
    `select browser from metric where site_token=(
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
    `select device from metric where site_token=(
        select token from site where belongs_to=? and hostname=?
     ) group by device`,
    [id, hostname]
  );
}

export async function queryMetric(ctx) {
  const query = ctx.query;
  // Get site token which belongs to this user;
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
    key, 'dateRange[]': dateRange, dimension, path, network_isp, city, browser, device,
    interval
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
  if (path) conditions.page_url = path;
  if (network_isp) conditions.network_isp = network_isp;
  if (browser) conditions.browser = browser;
  if (device) conditions.device = device;
  if (city) conditions.city = city;

  let whereClause = '';
  const conditionKeys = Object.keys(conditions);
  const hasCondition = conditionKeys.length > 0;

  // Assemble query conditions manually,
  // `mysql` plugin doesn't support this kind of functionality
  if (hasCondition) {
    for (const key of conditionKeys) {
      whereClause += `${key}=${mysql.escape(conditions[key])} and `;
    }
  }

  // Judge chart data intervals, default by `minute`
  let dateFormat: string = `DATE_FORMAT(time,'%Y-%m-%d %H:%i')`;
  if (interval === 'day') {
    dateFormat = `DATE_FORMAT(time,'%Y-%m-%d')`;
  } else if (interval === 'hour') {
    dateFormat = `DATE_FORMAT(time,'%Y-%m-%d %H')`;
  } else if (interval === 'minute') {
    dateFormat = `DATE_FORMAT(time,'%Y-%m-%d %H:%i')`;
  }

  const sql = `select AVG(??) as ??, ??, ${dateFormat} as time
    from metric
    where ${whereClause}time >= ? and time <= ? and site_token=(
        select token from site where belongs_to=? and hostname=?
     )
    group by ${dateFormat + ','} ??;`;

  const queryData = [key, key, dimension, dateRange[0], dateRange[1], id, hostname, dimension];
  const psql = mysql.format(sql, queryData);

  Logger.info(psql);

  try {
    ctx.body = await QueryService.SQLQuery(sql, queryData);
  } catch (error) {
    Logger.error(error);
    ctx.status = 500;
    ctx.body = { status: 'Server Error' };
  }
}
