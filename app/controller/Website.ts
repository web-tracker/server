import * as uuid from 'node-uuid';
import * as QueryService from '../service/Query';
import { Logger } from '../Logger';

export function isValidAlertLine(line) {
  return line >= 0 && line <= 1000;
}

function validaWebsiteInfo(website) {
  if (!website.name || !website.hostname || !website.token ||
    isNaN(website.metric_alert_line) || isNaN(website.error_alert_line)
  ) {
    throw new Error('Invalid Input');
  }

  if (!isValidAlertLine(website.metric_alert_line) || !isValidAlertLine(website.error_alert_line)) {
    throw new Error('Alert line number should between 0 and 1000');
  }
}

export async function getWebsiteList(ctx) {
  const userId = ctx.session.userId;
  ctx.body = await QueryService.SQLQuery(
    `select * from site where belongs_to=?`,
    userId
  );
}

export async function updateWebsite(ctx) {
  if (ctx.request.method !== 'POST') {
    ctx.body = {
      status: 'Can only use POST method'
    };
    ctx.status = 400;
  }
  const website = ctx.request.body;
  website.token = website.token || uuid.v4();
  Logger.info(website);
  const {
    id, name, hostname, token, metric_alert_enabled,
    metric_alert_line, error_alert_enabled, error_alert_line
  } = website;

  try {
    validaWebsiteInfo(website);
  } catch (error) {
    ctx.body = {
      status: error.message
    };
    ctx.status = 400;
    return;
  }

  try {
    await QueryService.SQLQuery('update site set ? where id=?', [{
      name, hostname, token, metric_alert_enabled,
      metric_alert_line, error_alert_enabled, error_alert_line
    }, id]);

    ctx.body = {
      status: 'Website was succesfully updated'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: '[Unknown Error] Can not update website infomation'
    };
  }
}

export async function removeWebsite(ctx) {
  const id = ctx.query.id;
  Logger.info('delete id:', id);
  try {
    await QueryService.SQLQuery('delete from site where id = ?', id);
    ctx.body = {
      status: 'Website was successfully remofved'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'Unknown error'
    };
  }
}

export async function createWebsite(ctx) {
  if (ctx.request.method !== 'POST') {
    ctx.body = {
      status: 'Can only use POST method'
    };
    ctx.status = 400;
  }
  const website = ctx.request.body;
  const userId = ctx.session.userId;
  Logger.info(website);

  // Generate token if not exists
  website.token = website.token || uuid.v4();

  const {
    name, hostname, token, metric_alert_enabled,
    metric_alert_line, error_alert_enabled, error_alert_line
  } = website;

  try {
    validaWebsiteInfo(website);
  } catch (error) {
    ctx.body = {
      status: error.message
    };
    ctx.status = 400;
    return;
  }

  try {
    await QueryService.SQLQuery('insert into site set ?', {
      name, hostname, token, metric_alert_enabled,
      metric_alert_line, error_alert_enabled, error_alert_line,
      belongs_to: userId
    });
    ctx.body = {
      status: 'Website was succesfully created'
    };
  } catch (error) {
    Logger.error(error);
    ctx.status = 500;
    ctx.body = {
      status: '[Unknown Error] Can not create website'
    };
  }
}
