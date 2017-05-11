import connection from '../Database';

// TODO: Limits to specific user, the same the other services below.
export function getCurrentAverageTotalLoadingTime() {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT avg(`total_loading_time`) AS averageLoadingTime FROM `metric` WHERE TO_DAYS(time) = TO_DAYS(now());',
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Can not get average loading time');
        }
        resolve(
          parseFloat(result[0]['averageLoadingTime'])
        );
      });
  });
}

export function getHistoryAverageTotalLoadingTime() {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT avg(`total_loading_time`) as averageLoadingTime FROM `metric` WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY)<=time;',
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Can not get average loading time within 30 days');
        }
        resolve(
          parseFloat(result[0]['averageLoadingTime'])
        );
      });
  });
}

export function getHistoryTotalLoadingTime(daysAgo: number) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT total_loading_time, time FROM `metric` WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY)<=time;',
      daysAgo,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
  });
}

export function getCurrentAverageFirstPaintTime(userId: string, hostname: string) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      `SELECT avg(first_paint_time) as averageFirstPaintTime FROM metric WHERE TO_DAYS(time) = TO_DAYS(now())
        and site_token = (select token from site where belongs_to=? and hostname=?)`,
      [userId, hostname],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Query first paint time failed');
        }
        resolve(
          parseFloat(result[0]['averageFirstPaintTime'])
        );
      }
    );
  });
}

export function getHistoryAverageFirstPaintTime(userId: string, hostname: string) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT avg(`first_paint_time`) as averageFirstPaintTime FROM `metric` WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY)<=time and site_token = (select token from site where belongs_to=? and hostname=?);',
      [userId, hostname],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Can not get average loading time within 30 days');
        }
        resolve(
          parseFloat(result[0]['averageFirstPaintTime'])
        );
      });
  });
}

export function getHistoryFirstPaintTime(daysAgo: number) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT first_paint_time, time FROM `metric` WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY)<=time;',
      daysAgo,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
  });
}

export function getMetricOverview(daysAgo: number) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      `SELECT first_paint_time, first_interaction_time, total_loading_time, downloading_time, first_byte_time, scripts_time, DATE_FORMAT(time, "%m-%d") as time
        FROM metric
        WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY)<=time
        GROUP BY CAST(time AS DATE);`,
      daysAgo,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
  });
}

export function getMetricTimeOfToday(type: string, userId: string | number, hostname: string) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      `SELECT avg(??) as time FROM metric WHERE TO_DAYS(time) = TO_DAYS(now())
        and site_token = (select token from site where belongs_to=? and hostname=?)`,
      [type, userId, hostname],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Query metric time failed');
        }
        resolve(
          parseFloat(result[0]['time'])
        );
      }
    );
  });
}

export function getHistoryMetricTime(type: string, userId: string | number, hostname: string) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      'SELECT avg(??) as time FROM `metric` WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY)<=time and site_token = (select token from site where belongs_to=? and hostname=?);',
      [type, userId, hostname],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || result.length <= 0) {
          return reject('Can not get metric time within 30 days');
        }
        resolve(
          parseFloat(result[0]['time'])
        );
      });
  });
}
export function countAbnormalMetricOfToday(type: string, average: number, userId: string | number, hostname: string) {
  return new Promise<number>((resolve, reject) => {
    connection.query(
      `select count(??) as count from metric
      where site_token = (select token from site where belongs_to=? and hostname=?) and TO_DAYS(time) = TO_DAYS(now())
      and first_paint_time > ?`,
      [type, userId, hostname, average],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result[0].count);
      }
    );
  });
}
