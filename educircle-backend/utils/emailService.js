const nodemailer = require('nodemailer');

// Email transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD 
  }
});

// Şifre sıfırlama emaili gönder
const sendPasswordResetEmail = async (email, resetCode, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'EduCircle - Şifre Sıfırlama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">EduCircle</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Merhaba ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Şifrenizi sıfırlamak için aşağıdaki kodu kullanın. Bu kod 15 dakika geçerlidir.
            </p>
            
            <div style="background-color: #fff; border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">
                ${resetCode}
              </h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Bu kodu kimseyle paylaşmayın. Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Bu email EduCircle platformu tarafından gönderilmiştir.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email gönderildi:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 