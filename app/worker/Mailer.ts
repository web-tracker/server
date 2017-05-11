import * as nodemailer from 'nodemailer';

export class Mailer {
  private transporter = nodemailer.createTransport({
    host: 'smtp.sina.com',
    port: 465,
    secure: true,
    auth: {
      user: 'web_tracker@sina.com',
      pass: 'webtracker123'
    }
  });

  // setup email data with unicode symbols
  private mailOptions = {
    from: '"WebTracker Alerts" <web_tracker@sina.com>'
  };

  public send(toEmail: string, subject: string, content: string[]) {
    return new Promise((resolve, reject) => {
      // send mail with defined transport object
      const options = Object.assign(this.mailOptions, {
        to: toEmail,
        subject: subject,
        text: content.join('\n')
      });
      console.log(options);
      this.transporter.sendMail(options, (error, info) => {
        if (error) {
          return reject(error);
        }
        resolve(info);
        console.log('Message %s sent: %s', info.messageId, info.response);
      });
    });
  }

}
