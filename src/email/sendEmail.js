function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        // Το URL είναι σωστό, αλλά το API θέλει πολύ συγκεκριμένο JSON format
        fetch("https://api.courier.com/send", {
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
                        body: html // Εδώ περνάει το κείμενο/HTML του verification κώδικα
                    },
                    routing: {
                        method: "single",
                        channels: ["email"]
                    }
                }
            })
        })
        .then(async response => {
            const textData = await response.text();
            
            // Αν επιστρέψει σφάλμα (π.χ. 405 ή 400), το τυπώνουμε καθαρά
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
