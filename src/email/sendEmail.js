async function sendEmail(to, subject, html) {
    try {
        // Χρησιμοποιούμε απευθείας τη fetch του Node 24 (χωρίς require)
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
                        html: html // Χρησιμοποιούμε html αντί για body
                    },
                    routing: {
                        method: "single",
                        channels: ["email"]
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
