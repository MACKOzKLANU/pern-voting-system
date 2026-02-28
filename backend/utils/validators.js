export function isSchoolEmail(email) {
    const regex = /^[a-z0-9._%+-]+@zgierz\.edu\.pl$/;
    return regex.test(email);
}
