import nodemailer from 'nodemailer';
import hbs from 'handlebars';
import fs from 'fs';
import path from 'path';
import mailConfig from '../config/mail.js';
import logger from '../middlewares/logger.js';

const transporter = nodemailer.createTransport(mailConfig);

const compileTemplate = (templateName, context) => {
  const filePath = path.join(
    path.resolve(),
    'src',
    'templates',
    `${templateName}.hbs`
  );
  const templateSource = fs.readFileSync(filePath, 'utf8');
  const compiledTemplate = hbs.compile(templateSource);
  return compiledTemplate(context);
};

const sendMail = async ({ to, subject, template, context }) => {
  try {
    const html = compileTemplate(template, context);

    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent', {
      to,
      subject,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message,
    });
    throw error;
  }
};

export default {
  sendMail,
};
