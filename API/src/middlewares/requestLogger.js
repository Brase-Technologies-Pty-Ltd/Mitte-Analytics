// src/middlewares/requestLogger.js
import logger from './logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP Request', {
      type: 'http',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      origin: req.headers.origin,
      userId: req.user?.id || 'anonymous',
      userEmail: req.user?.email || null,
      userName: req.user?.user_name || null,
    });
  });

  next();
};

export default requestLogger;
