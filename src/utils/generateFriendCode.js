function generateFriendCode() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*?";
    const numbers = "0123456789";

    function pick(str, count) {
        let out = "";
        for (let i = 0; i < count; i++) {
            out += str[Math.floor(Math.random() * str.length)];
        }
        return out;
    }

    return "TM" +
        pick(upper, 2) +
        pick(lower, 2) +
        pick(symbols, 2) +
        pick(numbers, 2);
}

module.exports = generateFriendCode;
