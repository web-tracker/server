import connection from '../Database';

export function SQLQuery(sql: string, params?: any) {
  return new Promise<any>((resolve, reject) => {
    connection.query(
      sql,
      params,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
    });
  });
}