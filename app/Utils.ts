import * as request from 'request';
import * as Router from 'koa-router';

export function requestGet(config) {
  return new Promise<any>((resolve, reject) => {
    request.get(config, (error, _, body) => {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
}

interface Route {
  module: Router.IMiddleware;
  path: string;
}

export function resolveRoutes(controllerPath: string): Array<Route> {
  const modules = require(controllerPath);
  const keys = Object.keys(modules);
  return keys.map<Route>(key => {
    let path = key;
    const token = key.split('$');
    if (token.length > 1) {
      const funcName = token.splice(0, 1)[0];
      const params = token.map(p => `:${p}`);
      params.unshift(funcName);
      path = params.join('/');
    }
    return {
      module: modules[key],
      path: path
    };
  });
}

export function normalizePercentage(num: number) {
  return ((num) * 100).toFixed(2);
}
