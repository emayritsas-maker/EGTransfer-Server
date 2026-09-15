function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        // Χρησιμοποιούμε το σωστό, επίσημο Production endpoint της Courier
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
                        body: html // Εδώ περνάει ο κώδικας register
                    },
                    routing: {
                        method: "single",
                        providers: ["courier"] // Στέλνει αυτόματα η Courier
                    }
                }
            })
        })
        .then(async response => {
            const textData = await response.text();
            
            if (!response.ok) {
                throw new Error(`Courier API Error [${response.status}]: ${textData}`);
            }

            try {
                const jsonData = JSON.parse(textData);
                console.log("[COURIER] Success!", jsonData);
                resolve(jsonData);
            } catch (e) {
                console.log("[COURIER] Response Text:", textData);
                resolve(textData);
            }
        })
        .catch(err => {
            console.error("[COURIER ERROR]", err.message);
            reject(err);
        });
    });
}

module.exports = sendEmail;
