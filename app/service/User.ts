import Logger from '../Logger';
import { requestGet } from '../Utils';
import connection from '../Database';

const userProfileUrl = 'https://api.github.com/user';

export async function register(accessToken: string) {
  // Retrieve user infomation
  const profileUrl = `${userProfileUrl}?access_token=${accessToken}`;
  const user = await requestGet({
    url: profileUrl,
    json: true,
    headers: {
      'User-Agent': 'request'
    }
  });

  if (!user) {
    Logger.error('Can not found User via github API');
    return;
  }

  const profile = {
    id: user.id,
    username: user.name,
    avatar: user.avatar_url,
    email: user.email
  };

  if (!profile.id) {
    Logger.error('Can not get correct profile from github', profile);
    return;
  }

  // Insert user profile into databse,
  // update user profile when exists.
  return new Promise<any>((resolve, reject) => {
    connection.query(
      'REPLACE INTO `user` SET ?',
      profile,
      (error, results) => {
        if (error) {
          return reject(error);
        }
        if (results.affectedRows < 1) {
          Logger.error('Can not insert user profile into database');
          return reject();
        }
        resolve(profile);
      });
  });
}

export function query(userId: string) {
  return new Promise<any>((resolve, reject) => {
    connection.query(
      'SELECT * from `user` WHERE id=?',
      userId,
      (error, results) => {
        if (error) {
          return reject(error);
        }
        if (results.length <= 0) {
          return reject();
        }
        resolve(results[0]);
      });
  });
}

export async function getUerEmailById(userId: number) {
  return new Promise<any>((resolve, reject) => {
    connection.query(
      'SELECT * from `user` WHERE id=?',
      userId,
      (error, results) => {
        if (error) {
          return reject(error);
        }
        if (results.length <= 0) {
          return reject();
        }
        resolve(results[0]['email']);
      });
  });
}
