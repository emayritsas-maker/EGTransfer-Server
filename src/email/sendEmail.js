const fetch = require("node-fetch");

async function sendEmail(to, subject, html) {
    try {
        const response = await fetch("https://api.courier.com/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.COURIER_AUTH_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: {
                    to: {
                        email: to
                    },
                    content: {
                        title: subject,
                        body: html
                    },
                    from: {
                        email: process.env.COURIER_SENDER
                    }
                }
            })
        });

        const data = await response.json();
        console.log("[COURIER] Response:", data);
    } catch (err) {
        console.error("[COURIER ERROR]", err);
    }
}

module.exports = sendEmail;
