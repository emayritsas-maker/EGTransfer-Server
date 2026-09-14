const fetch = require("node-fetch");

async function sendEmail(to, subject, html) {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { email: process.env.BREVO_SENDER },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        const data = await response.json();
        console.log("[BREVO] Response:", data);
    } catch (err) {
        console.error("[BREVO ERROR]", err);
    }
}

module.exports = sendEmail;
