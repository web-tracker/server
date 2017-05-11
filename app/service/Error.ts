import { connection } from '../Database';

export async function getAbnormalErrorOfToday(userId: string | number, hostname: string, limit: number) {
  return new Promise<Array<any>>((resolve, reject) => {
    const sql = connection.query(
      `select * from (
          select count(*) as count, message, stack from error
          where site_token = (select token from site where belongs_to=? and hostname=?)
          group by script_url, message
       ) as e where e.count > ?`,
      [userId, hostname, limit],
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
  });
}
