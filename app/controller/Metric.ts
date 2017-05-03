import * as MetricService from '../service/Metric';
import * as QueryService from '../service/Query';
import { normalizePercentage } from '../Utils';

/**
 * Compute the overhead of average loading time.
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
  ctx.body = await QueryService.SQLQuery(
    `select network_isp from metric where site_token=(
        select token from site where belongs_to=?
      ) group by network_isp;`,
    id
  );
}

export async function pathCategory(ctx) {
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select page_url from metric where site_token=(
        select token from site where belongs_to=?
      ) group by page_url`,
    id
  );
}

export async function cityCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select city from metric where site_token=(
        select token from site where belongs_to=?
     ) group by city`,
    id
  );
}

export async function browserCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select browser from metric where site_token=(
        select token from site where belongs_to=?
     ) group by browser`,
    id
  );
}

export async function deviceCategory(ctx) {
  // Get site token which belongs to this user;
  const id = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select device from metric where site_token=(
        select token from site where belongs_to=?
     ) group by device`,
    id
  );
}