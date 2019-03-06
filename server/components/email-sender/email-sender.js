'use strict';
const nodemailer = require('nodemailer');
const config = require('../../config/environment');

var emailSender = [];

emailSender.sendEmail = function(from, to, subject, text, html) {
  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
    html: html
  };

  var transporter = nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailServiceAccount,
      pass: config.emailServicePassword
    }
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return console.log('Message %s sent: %s', info.messageId, info.response);
  });
};

export default emailSender;
