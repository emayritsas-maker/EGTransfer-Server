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

CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    key TEXT,
    value TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    friendId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(friendId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blocked (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    blockedId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(blockedId) REFERENCES users(id)
);
