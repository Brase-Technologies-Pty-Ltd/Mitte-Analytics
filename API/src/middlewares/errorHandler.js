// src/middlewares/errorHandler.js
import logger from "./logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled Error", {
    type: "error",
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    status: res.statusCode,
    origin: req.headers.origin,
    userId: req.user?.id || "anonymous",
    userEmail: req.user?.email || null,
    userName: req.user?.user_name || null,
  });

  res.status(500).json({ error: "Internal Server Error" });
};

export default errorHandler;
