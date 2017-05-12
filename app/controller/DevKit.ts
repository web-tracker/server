import * as URL from 'url';
import { resolveSDK } from '../service/DevKit';
import { SQLQuery } from '../service/Query';
import { Logger } from '../Logger';

const WEB_TRACKER = (token) =>
  `window.WEB_TRACKER = {
  token: '${token}',
  metric: {
    enabled: true
  },
  catcher: {
    enabled: true,
    random: 1,
    repeat: 5,
    merge: true,
    delay: 1000,
    exclude: []
  }
};`;

export async function SDKHandler(ctx) {
  // Referer represents which site the request is from
  const url = ctx.headers.referer;
  if (!url) {
    ctx.status = 404;
    return;
  }
  const hostname = URL.parse(url).hostname;
  if (!hostname) {
    ctx.status = 404;
    return;
  }
  try {
    const result = await SQLQuery(`select token from site where hostname=?`, hostname);
    if (!result || result.length <= 0) {
      throw new Error(`Token is not found`);
    }

    const token = result[0].token;
    const config = compressString(WEB_TRACKER(token));

    let sdkCode = await resolveSDK();
    sdkCode = config + sdkCode;
    ctx.body = sdkCode;
    ctx.type = 'application/javascript';
  } catch (error) {
    Logger.error(error);
    ctx.status = 404;
  }
}

function compressString(text: string) {
  return text.replace(/\s*\n*\r*/img, '');
}
