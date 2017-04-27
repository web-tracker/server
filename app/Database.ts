import * as mysql from 'mysql';
import { IConnectionConfig } from 'mysql';

const config: IConnectionConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'WebTracker'
};

const connection = mysql.createConnection(config);
export default connection;