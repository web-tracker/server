import { SQLQuery } from './Query';
import { Logger } from '../Logger';
import { Alert } from '../worker/AlertWorker';

export async function findAllAlertTasks() {
  const list = await SQLQuery('select * from site where metric_alert_enabled=1 or error_alert_enabled=1');
  return list;
}

export async function saveAlertRecord(alert: Alert) {
  const existRecord = await SQLQuery(
    'select id, count, count(*) as nums from alert_logs where site_id=? and job_type=? and type=? and stack=? and resolved=0',
    [alert.site.id, alert.jobType, alert.type, alert.stack || '']
  );

  // 1. No alert records, insert into database
  // 2. Alert exists but it's already resolved
  //    but reproduce again so we should create a new alert for it.
  if (!existRecord[0] || existRecord[0].nums === 0) {
    await SQLQuery('insert into alert_logs set ?', {
      site_id: alert.site.id,
      job_type: alert.jobType,
      type: alert.type,
      count: alert.count,
      overhead: alert.overhead,
      stack: alert.stack || '',
      time: new Date()
    });
    return true;
  }

  // Alert exists and is not resolved, update data in the database
  await SQLQuery('update alert_logs set count=?, overhead=? where id=?', [alert.count, alert.overhead, existRecord[0].id]);
  return false;
}

export async function resolveAlertById(userId: string, hostname: string, id: string | number) {
  await SQLQuery(
    `update alert_logs set resolved=1, resolved_time=now() where site_id=(select id from site where belongs_to=? and hostname=?) and id=?;`,
    [userId, hostname, id]
  );
}
