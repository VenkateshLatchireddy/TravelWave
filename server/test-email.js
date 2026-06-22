// test-email.js - Run this to test email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing email configuration...');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
  
  // Remove spaces from password
  const cleanPass = process.env.SMTP_PASS.replace(/\s/g, '');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: cleanPass,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    const info = await transporter.sendMail({
      from: `TravelWave <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: '✅ Test Email from TravelWave',
      html: '<h1>Testing!</h1><p>Your email configuration is working!</p>',
    });
    
    console.log('✅ Test email sent! Message ID:', info.messageId);
    console.log('📧 Check your inbox (and spam folder)');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();