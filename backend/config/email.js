const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Joy Juncture" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - Joy Juncture',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #8e44ad; margin-bottom: 30px; }
            .otp-box { background: linear-gradient(135deg, #8e44ad, #b565d8); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Joy Juncture</h1>
            </div>
            <p>Hello ${name || 'User'},</p>
            <p>Your One-Time Password (OTP) for login is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            <p>Please enter this code to complete your login and start playing games!</p>
            <p><strong>Do not share this code with anyone.</strong></p>
            <div class="footer">
              <p>If you didn't request this OTP, please ignore this email.</p>
              <p>&copy; 2025 Joy Juncture. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };
