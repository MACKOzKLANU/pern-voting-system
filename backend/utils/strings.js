export function capitalize(str) {
    if (!str) {
        return "";
    }
    const clean = str.trim().toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}