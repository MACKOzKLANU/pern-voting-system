import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';
import { generateOTP, generateToken, tokenExpiry } from '../utils/tokens.js';
import { sendVerificationOtp } from '../services/mailService.js';
import { capitalize, normalizeEmail } from '../utils/strings.js';
import { isSchoolEmail } from '../utils/validators.js';

const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let emailLowerCase = normalizeEmail(email);

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1',
        [emailLowerCase]
    );

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    if (!isSchoolEmail(emailLowerCase)) {
        return res.status(400).json({ message: 'Please provide a valid school email (@zgierz.edu.pl)' });
    }

    // Extract name and surname from email
    const [rawName, rest] = emailLowerCase.split('.');
    const rawSurname = rest.split('@')[0];

    const name = capitalize(rawName);
    const surname = capitalize(rawSurname);

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpPlain = generateOTP();

    const hashedOtp = await bcrypt.hash(otpPlain, 10)

    const otpExpires = tokenExpiry(0.5);

    const newUser = await pool.query(`
        INSERT INTO users (name, surname, email, password, verification_code, verification_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, surname, email`,
        [name, surname, emailLowerCase, hashedPassword, hashedOtp, otpExpires]
    );

    const token = generateToken(newUser.rows[0].id);

    res.cookie('token', token, cookieOptions);


    sendVerificationOtp(emailLowerCase, name, otpPlain)
        .catch(err => console.error("Failed to send verification email:", err));


    return res.status(201).json({ user: newUser.rows[0] });
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let emailLowerCase = normalizeEmail(email);

    const user = await pool.query('SELECT id, name, email, password from users WHERE email = $1',
        [emailLowerCase]
    );

    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = user.rows[0];


    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(userData.id);

    res.cookie('token', token, cookieOptions);

    res.json({ user: { id: userData.id, name: userData.name, email: userData.email } });
})

// Me

router.post('/me', protect, async (req, res) => {
    res.json(req.user);

    // return info of the logged in user from protect middleware
})

// Logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
    res.json({ message: 'Logged out successfully' });
})

export default router;