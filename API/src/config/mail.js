// src/config/mail.js
const isDev = process.env.NODE_ENV === 'development';

const config = isDev
  ? {
      host: process.env.DEV_SMTP_HOST,
      port: Number(process.env.DEV_SMTP_PORT),
      secure: process.env.DEV_SMTP_SECURE === 'true',
      from: process.env.DEV_SMTP_FROM,
    }
  : {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: process.env.SMTP_FROM,
    };

export default config;
