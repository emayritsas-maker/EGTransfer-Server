// Χρησιμοποιούμε μια standard function χωρίς top-level ESM await για να μην σπάει το require()
function sendEmail(to, subject, html) {
    // Επιστρέφουμε Promise για να μπορείς να κάνεις await εκεί που το καλείς
    return new Promise((resolve, reject) => {
        fetch("https://courier.com", {
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
                        body: html // Courier simple content body
                    },
                    routing: {
                        method: "single",
                        channels: ["email"]
                    }
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("[COURIER] Response:", data);
            resolve(data);
        })
        .catch(err => {
            console.error("[COURIER ERROR]", err);
            reject(err);
        });
    });
}

// Καθαρό CommonJS export για να διαβάζεται σωστά από τα routes σου
module.exports = sendEmail;
