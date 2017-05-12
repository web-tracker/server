import { SQLQuery } from '../service/Query';
import { resolveAlertById } from '../service/Alert';

export async function getTodaysAlertStats(ctx) {
  const userId = ctx.session.userId;
  const hostname = ctx.query.hostname;
  if (!hostname) {
    ctx.status = 400;
    ctx.body = {
      status: 'Please provide hostname'
    };
    return;
  }
  ctx.body = await SQLQuery(
    `select id, type, count, resolved, DATE_FORMAT(resolved_time,'%Y-%m-%d %H:%i') as resolved_time, DATE_FORMAT(time,'%Y-%m-%d %H:%i') as time
     from alert_logs where TO_DAYS(time)=TO_DAYS(now())
       and site_id=(select id from site where belongs_to=? and hostname=?)
     group by DATE_FORMAT(time,'%Y-%m-%d %H:%i'), type`,
    [userId, hostname]
  );
}

export async function resolveAlert(ctx) {
  const userId = ctx.session.userId;
  const hostname = ctx.query.hostname;
  const alertId = ctx.query.alertId;
  try {
    await resolveAlertById(userId, hostname, alertId);
    ctx.body = {
      status: 'Successfully resolved'
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: 'Unknown Error'
    };
  }
}
