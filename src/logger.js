import loggerGenerator, {stdSerializers} from 'pino';

const logger = loggerGenerator({
  level: 'info',
  serializers: {
    err: stdSerializers.err,
  },
});

// logger.level = 10 /* trace */; // Enable for debugging only

export default logger;
