// Χρησιμοποιούμε το native https module του Node.js για να παρακάμψουμε το global fetch bug
const https = require('https');

function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { name: "EG Transfer", email: "paixatz2@gmail.com" },
            to: [{ email: "paixatz2@gmail.com" }], // Στέλνει πάντα σε εσένα για τις δοκιμές
            subject: subject,
            htmlContent: html
        });

        const options = {
    hostname: 'api.brevo.com', // <-- ΠΡΟΣΟΧΗ: Σκέτο api.brevo.com, ΟΧΙ ://brevo.com
    port: 443,
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'Content-Length': data.length
    }
};

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseBody);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log("[BREVO SUCCESS]", parsedData);
                        resolve(parsedData);
                    } else {
                        reject(new Error(`Brevo Error [${res.statusCode}]: ${responseBody}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Brevo response: ${responseBody}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error("[BREVO HTTPS CRITICAL ERROR]", err.message);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

module.exports = sendEmail;
