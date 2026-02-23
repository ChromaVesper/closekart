const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    // For production, use real SMTP credentials. Using a generic service check here.
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service
        auth: {
            user: process.env.EMAIL_USERNAME || 'test@example.com',
            pass: process.env.EMAIL_PASSWORD || 'password123',
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `CloseKart <${process.env.EMAIL_USERNAME || 'noreply@closekart.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error("Email sending failed:", error);
        // We log it but do not throw, so local testing without real credentials doesn't crash the server.
        // The reset token is returned in the API response or console log for local dev.
    }
};

module.exports = sendEmail;
