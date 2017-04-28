import * as Koa from 'koa';

interface Context extends Koa.Context {
  session: any;
}