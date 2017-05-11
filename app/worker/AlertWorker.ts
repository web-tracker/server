import { findAllAlertTasks, saveAlertRecord } from '../service/Alert';
import { Logger } from '../Logger';
import { normalizePercentage } from '../Utils';
import { countAbnormalMetricOfToday, getMetricTimeOfToday, getHistoryMetricTime } from '../service/Metric';
import { getAbnormalErrorOfToday } from '../service/Error';
import { Mailer } from './Mailer';
import { getUerEmailById } from '../service/User';

interface Site {
  id: number;
  hostname: string;
  token: string;
  belongs_to: number;
  metric_alert_line: number;
  error_alert_line: number;
  metric_alert_enabled: number;
  error_alert_enabled: number;
}

export class Alert {
  constructor(
    public site: Site,
    public jobType: 'metric' | 'error',
    public type: string,
    public count: number,
    public overhead: string | null,    // Percentage
    public stack: string | null        // Error stack
  ) { }
}

export class AlertWorker {

  // MillionSecond
  constructor(private interval: number = 10000) { }

  async start() {
    // Check website metric at specific interval
    this.startCronTasks();
    setInterval(() => {
      this.startCronTasks();
    }, this.interval);
  }

  private async startCronTasks() {
    const alertTasks: Site[] = await findAllAlertTasks();

    // Pick specific task to its handlers
    const alertList: Alert[] = [];
    for (const task of alertTasks) {
      if (!!task.metric_alert_enabled) {
        alertList.push(...await this.metricStatusChecker(task));
      }
      if (!!task.error_alert_enabled) {
        alertList.push(...await this.errorStatusChecker(task));
      }
    }

    // Write record to alert service
    for (const alert of alertList) {
      const isNewAlert = await saveAlertRecord(alert);
      // Notify alerts via email
      if (isNewAlert) {
        try {
          await sendAlertEmail(alert);
        } catch (error) {
          Logger.error('Failed to send alert email', error);
        }
      }
    }
  }

  private async metricStatusChecker(site: Site): Promise<Alert[]> {
    Logger.info('[Metric] check cycle');
    const metricTypes = ['first_paint_time', 'total_loading_time', 'dom_parsing_time', 'dns_lookup_time', 'images_time'];
    return (await Promise.all(
      metricTypes.map(type => checkMetricOverhead(site, type))
    )).filter(ret => !!ret) as Alert[];
  }

  private async errorStatusChecker(site: Site): Promise<Alert[]> {
    Logger.info('[Error] check cycle');
    return await checkErrorOverhead(site);
  }

}

/**
 * Metric checking helpers
 */
async function checkMetricOverhead(site: Site, type: string) {
  let todayTime = await getMetricTimeOfToday(type, site.belongs_to, site.hostname);
  const pastTime = await getHistoryMetricTime(type, site.belongs_to, site.hostname);
  // No data for now
  if (isNaN(todayTime)) todayTime = pastTime;
  const overhead = ((todayTime - pastTime) / pastTime) * 100;
  // Abnormal metric data found, try to count abnormal data
  // when abmornal count larger than set line, make it alert.
  if (overhead > 100) {
    const count = await countAbnormalMetricOfToday(type, pastTime, site.belongs_to, site.hostname);
    if (count > site.metric_alert_line) {
      Logger.error('Alerting', type);
      return new Alert(site, 'metric', type, count, overhead.toFixed(2), null);
    }
  }
  return null;
}

/**
 * Error checking helpers
 */
async function checkErrorOverhead(site: Site) {
  const results = await getAbnormalErrorOfToday(site.belongs_to, site.hostname, site.error_alert_line);
  Logger.error(results.toString());
  return results.map(r => new Alert(site, 'error', r.message, r.count, null, r.stack));
}

const mailer = new Mailer();
async function sendAlertEmail(alert: Alert) {
  const receiverEmail = await getUerEmailById(alert.site.belongs_to);

  let subject: string = '';
  let content: string[] = [];

  // Construct email content
  if (alert.jobType === 'metric') {
    subject = `[WebTracker Alerts] Performance Metric Issue-${alert.site.hostname}`;
    content.push(`Performance Metric Issue in your website: ${alert.site.hostname}`);
    content.push(`Alert Type: ${alert.type}`);
    content.push(`Overhead: ${alert.overhead}`);
    content.push(`Overhead: ${alert.site.hostname}`);
    content.push('\n[Please log into [WebTracker] dashboard to fix this issue as soon as possible]');
  } else if (alert.jobType === 'error') {
    subject = `[WebTracker Alerts] Error Logs Issue-${alert.site.hostname}`;
    content.push(`Error Logs Issue in your website: ${alert.site.hostname}`);
    content.push(`Alert Type: ${alert.type}`);
    content.push(`Appear Count: ${alert.count}`);
    content.push(`Error Stack: ${alert.stack}`);
    content.push(`Overhead: ${alert.site.hostname}`);
    content.push('\n[Please log into [WebTracker] dashboard to fix this issue as soon as possible]');
  }

  try {
    await mailer.send(
      receiverEmail,
      subject,
      content
    );
  } catch (error) {
    Logger.error('Mailer Error', error);
    // Try again
    await sendAlertEmail(alert);
  }
}
