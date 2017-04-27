import * as request from 'request';

export default function requestGet(config) {
  return new Promise<any>((resolve, reject) => {
    request.get(config, (error, _, body) => {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
}