import loggerGenerator from 'pino';

const logger = loggerGenerator({level: 'info'});
// const logger = loggerGenerator({level: 'trace'});

export default logger;
