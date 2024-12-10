import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export const sendMail = async (email: string, verificationCode: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.me.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: {
        name: 'Vetra',
        address: process.env.EMAIL_USER || ''
      },
      to: email,
      subject: 'Verification Code',
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verification Code</title>
          <style>
            * {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              color: #0a090b;
              box-sizing: border-box;
            }
            .email-container {
              max-width: 600px;
              min-width: 400px;
              margin: 20px auto;
              padding: 30px;
              background: #fff;
              border: 1px solid #eee;
            }
            
            /* Header */
            .email-header {
              width: 40px;
              height: 40px;
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 18px;
              color: #DC143C;
              text-align: left;
            }
            
            /* Body */
            .email-body {
              font-size: 16px;
              line-height: 2;
              
              margin-top: 30px;
            }
            .email-code {
              width: 100%;
              font-size: 30px;
              font-weight: 700;
              letter-spacing: 0.2em;
              background: #f1f1f1;
              text-align: center;
              border-radius: 10px;
              padding: 20px 0;
              margin: 25px 0;
            }
            .email-code__text{
              font-size: 16px;
              line-height: 22px;
            }
            
            /* Footer */
            .email-footer {
              text-align: center;
              font-size: 14px;
              color: #666;
              
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1 class="email-header"><img src="https://static.thenounproject.com/png/7745-200.png" alt="Logo"></h1>
            <div class="email-body">
              <p>Hi there,</p>
              <p>This is your one time verification code.</p>
              <div class="email-code">${verificationCode}</div>
              <p class="email-code__text">This code is only active for the next 10 minutes. Once the code expires you will have to resubmit a request for a code.</p>
            </div>
            <div class="email-footer">
              &copy; ${new Date().getFullYear()} ${new Date().getFullYear()} LUXURY HOTEL. All rights reserved.
            </div>
          </div>
        </body>
      </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD);
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};
