import * as winston from 'winston';

const Logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      colorize: true
    })
  ]
});

// Inject into global context
// Todo: To solve compile error in global
(global as any).Logger = Logger as winston.LoggerInstance;
export default Logger;
export { Logger };