import * as MetricService from '../service/Metric';
import { normalizePercentage } from '../Utils';

/**
 * Compute the overhead of average loading time.
 */
export async function averageLoadingTimeOverhead(ctx) {
  const todayLoadingTime = await MetricService.getCurrentAverageTotalLoadingTime();
  const pastLoadingTime = await MetricService.getHistoryAverageTotalLoadingTime();
  ctx.body = {
    averageLoadingTimeOverhead: normalizePercentage((todayLoadingTime - pastLoadingTime) / pastLoadingTime)
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
  const todayPaintTime = await MetricService.getCurrentAverageFirstPaintTime();
  const pastPaintTime = await MetricService.getHistoryAverageFirstPaintTime();
  ctx.body = {
    averageFirstPaintTimeOverhead: normalizePercentage((todayPaintTime - pastPaintTime) / pastPaintTime)
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