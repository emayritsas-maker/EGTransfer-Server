function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        fetch("https://brevo.com", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "EG Transfer", email: "paixatz2@gmail.com" }, // Το Gmail της εγγραφής σου
                to: [{ email: "paixatz2@gmail.com" }], // Στέλνει ΠΑΝΤΑ σε εσένα για τις δοκιμές
                subject: subject,
                htmlContent: html
            })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Brevo Error [${response.status}]: ${JSON.stringify(data)}`);
            }
            console.log("[BREVO SUCCESS]", data);
            resolve(data);
        })
        .catch(err => {
            console.error("[BREVO API ERROR]", err.message);
            reject(err);
        });
    });
}

module.exports = sendEmail;
