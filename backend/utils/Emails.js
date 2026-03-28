const nodemailer = require('nodemailer');

exports.sendMail = async(receiverEmail, subject, body) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: receiverEmail,
    subject: subject,
    text: body
  };

  await transporter.sendMail(mailOptions);
};