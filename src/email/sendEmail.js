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
                body: html // Το γυρνάμε σε body όπως το είχες αρχικά
            },
            routing: {
                method: "single",
                channels: ["email"]
            }
        }
    })
});
