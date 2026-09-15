function sendEmail(to, subject, html) {
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
                        body: html
                    },
                    routing: {
                        method: "single",
                        // Λέμε στο Courier να χρησιμοποιήσει τον δικό του provider
                        providers: ["courier"] 
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
                console.log("[COURIER] Success Response:", jsonData);
                resolve(jsonData);
            } catch (e) {
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
