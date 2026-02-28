#!/usr/bin/env node

/**
 * Quick SMTP Test Script for BarakahBrain
 * Tests your email configuration before deployment
 * 
 * Usage: node test-smtp.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
} = process.env;

if (!SMTP_HOST || !SMTP_USER) {
    console.error('❌ SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    process.exit(1);
}

const testEmail = process.argv[2] || 'test@example.com';

console.log('🧪 Testing SMTP Configuration...\n');
console.log('📧 Config:');
console.log(`  Host: ${SMTP_HOST}`);
console.log(`  Port: ${SMTP_PORT || 587}`);
console.log(`  User: ${SMTP_USER}`);
console.log(`  Secure: ${SMTP_SECURE === 'true' ? 'TLS' : 'STARTTLS'}`);
console.log(`  From: ${SMTP_FROM}`);
console.log(`  Test email: ${testEmail}\n`);

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: SMTP_SECURE === 'true',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

(async () => {
    try {
        console.log('⏳ Connecting to SMTP server...');
        await transporter.verify();
        console.log('✅ Connected!\n');

        console.log('📤 Sending test email...');
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to: testEmail,
            subject: 'BarakahBrain SMTP Test',
            html: `
                <h2>✅ BarakahBrain SMTP Test</h2>
                <p>If you received this email, your SMTP configuration is working!</p>
                <hr/>
                <p><strong>Configuration Details:</strong></p>
                <ul>
                    <li>Host: ${SMTP_HOST}</li>
                    <li>Port: ${SMTP_PORT || 587}</li>
                    <li>From: ${SMTP_FROM}</li>
                    <li>To: ${testEmail}</li>
                </ul>
                <p>You can now safely deploy to Render with these settings.</p>
            `
        });

        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}\n`);
        console.log('🎉 SMTP is ready for production!\n');
        console.log('Next steps:');
        console.log('  1. Check your email inbox for the test message');
        console.log('  2. If received, your SMTP settings are correct');
        console.log('  3. Add SMTP_* variables to Render dashboard');
        console.log('  4. Deploy your app\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ SMTP Test Failed:\n');
        console.error(`   Error: ${error.message}\n`);
        console.error('💡 Troubleshooting tips:');
        console.error('  • Check SMTP_HOST, SMTP_USER, SMTP_PASS are correct');
        console.error('  • Verify SMTP_PORT (usually 587 for TLS, 465 for SSL)');
        console.error('  • If using SSL, set SMTP_SECURE=true');
        console.error('  • Check if firewall/VPN blocks the SMTP port');
        console.error('  • For Gmail: use App Password, not regular password');
        console.error('  • For Mailtrap: check credentials in Integration → Nodemailer');
        console.error('\n📖 See GUIDE_SMTP_CONFIG.md for detailed setup instructions\n');
        process.exit(1);
    }
})();
