const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // false επειδή χρησιμοποιούμε τη θύρα 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                // Επιτρέπει τη σύνδεση ακόμα κι αν το Render έχει αυστηρούς κανόνες για τα πιστοποιητικά
                rejectUnauthorized: false
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
