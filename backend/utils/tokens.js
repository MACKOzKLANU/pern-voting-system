import crypto from 'crypto';

// Expiry timestamps

export function tokenExpiry(hours = 1) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Generates a cryptographically strong random 6-digit number
export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}