export function isLoginIdValid(loginId) {
  return /^[a-zA-Z0-9]{1,255}$/.test(loginId);
}

export function isEmailFormatValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isPasswordValid(password) {
  return password.length >= 8
    && /[a-zA-Z]/.test(password)
    && /[0-9]/.test(password)
    && /[^a-zA-Z0-9]/.test(password);
}
