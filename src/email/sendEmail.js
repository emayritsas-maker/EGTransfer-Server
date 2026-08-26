const axios = require("axios");

async function sendEmail(to, subject, html) {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

    const data = {
        personalizations: [
            {
                to: [{ email: to }],
                subject: subject
            }
        ],
        from: { email: "noreply@egtransfer.com" },
        content: [
            {
                type: "text/html",
                value: html
            }
        ]
    };

    await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        data,
        {
            headers: {
                Authorization: `Bearer ${SENDGRID_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );
}

module.exports = sendEmail;
