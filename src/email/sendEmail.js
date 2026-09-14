function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        // Διορθωμένο URL: /messages αντί για /send
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
                        body: html // Εδώ το Courier δέχεται το περιεχόμενό σου
                    },
                    routing: {
                        method: "single",
                        channels: ["email"]
                    }
                }
            })
        })
        .then(async response => {
            // Αν ο server επιστρέψει σφάλμα, διάβασε το ως κείμενο για να μην κρασάρει το JSON.parse
            const textData = await response.text();
            
            if (!response.ok) {
                throw new Error(`Courier API Error [${response.status}]: ${textData}`);
            }

            try {
                const jsonData = JSON.parse(textData);
                console.log("[COURIER] Success Response:", jsonData);
                resolve(jsonData);
            } catch (e) {
                console.log("[COURIER] Raw Text Response:", textData);
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
