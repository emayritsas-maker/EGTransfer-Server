const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            html: html
        });

        console.log("[SMTP] Email sent to:", to);
    } catch (err) {
        console.error("[SMTP ERROR]", err);
    }
}

module.exports = sendEmail;
