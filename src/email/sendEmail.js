const fetch = require("node-fetch");

async function sendEmail(to, subject, text) {
    const token = process.env.MAILERSEND_TOKEN;

    await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: {
                email: "egtransfer.noreply@gmail.com",
                name: "EGTransfer"
            },
            to: [
                { email: to }
            ],
            subject: subject,
            text: text
        })
    });
}

module.exports = sendEmail;
