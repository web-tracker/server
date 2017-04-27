import Logger from '../Logger';
import requestGet from '../Utils';
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
    Logger.info('Can not found User via github API');
    return;
  }

  const profile = {
    id: user.id,
    username: user.name,
    avatar: user.avatar_url,
    email: user.email
  };

  // Insert user profile into databse,
  // update user profile when exists.
  return new Promise((resolve, reject) => {
    connection.query(
      'REPLACE INTO `user` SET ?',
      profile,
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
    });
  });
}