CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    passwordHash TEXT,
    friendcode TEXT UNIQUE,
    lastLogin TEXT,
    ip TEXT,
    isVerified INTEGER,
    verificationCode TEXT
);
