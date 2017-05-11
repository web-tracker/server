import * as mysql from 'mysql';
import { IConnectionConfig } from 'mysql';

const config: IConnectionConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'web_tracker'
};

const connection = mysql.createConnection(config);
export default connection;
export { connection }
