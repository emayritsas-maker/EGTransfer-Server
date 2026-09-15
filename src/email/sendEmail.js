function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        // Χρησιμοποιούμε το ΝΕΟ endpoint που δεν πετάει 405
        fetch("https://courier.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.COURIER_AUTH_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: {
                    to: {
                        email: to // Ο παραλήπτης
                    },
                    content: {
                        title: subject,
                        body: html // Το κείμενο/HTML του verification κώδικα
                    },
                    routing: {
                        method: "single",
                        providers: ["courier"] // Χρήση του Courier Provider αντί για Gmail
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
                console.log("[COURIER] Text Response:", textData);
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
