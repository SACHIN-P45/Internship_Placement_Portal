require('dotenv').config();
const { sendPasswordResetEmail } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log("Testing email service...");
    await sendPasswordResetEmail('pmalleswaran15@gmail.com', 'test-token-123', 'Test User');
    console.log("Test email sent success!");
  } catch (err) {
    console.error('Test error:', err);
  }
}

testEmail();
