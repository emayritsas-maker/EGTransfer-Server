const sendEmail = require("./sendEmail");

async function sendVerificationEmail(email, code) {
    const verifyLink = `https://egtransfer-web.netlify.app/verify?code=${code}`;

    const html = `
        <h2>Verify your EGTransfer account</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verifyLink}">Verify Account</a>
        <br><br>
        <p>If you did not create an account, ignore this email.</p>
    `;

    await sendEmail(email, "EGTransfer Email Verification", html);
}

module.exports = sendVerificationEmail;
