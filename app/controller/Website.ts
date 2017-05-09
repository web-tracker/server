import * as QueryService from '../service/Query';

export async function getWebsiteList(ctx) {
  const userId = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select * from site where belongs_to=?`,
    userId
  );
}
