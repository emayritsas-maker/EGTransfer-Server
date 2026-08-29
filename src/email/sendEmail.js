const fetch = require("node-fetch");

async function sendEmail(to, subject, html) {
    try {
        const response = await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MAILERSEND_API_KEY}`
            },
            body: JSON.stringify({
                from: {
                    email: process.env.MAILERSEND_FROM_EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject: subject,
                html: html
            })
        });

        const data = await response.json();
        console.log("[MAILERSEND] Response:", data);
    } catch (err) {
        console.error("[MAILERSEND ERROR]", err);
    }
}

module.exports = sendEmail;
