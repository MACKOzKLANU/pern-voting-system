import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Expiry timestamps

export function tokenExpiry(hours = 1) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Generates a cryptographically strong random 6-digit number
export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

export function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}