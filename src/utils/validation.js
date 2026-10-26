export function isPasswordValid(password) {
  return password.length >= 8
    && /[a-zA-Z]/.test(password)
    && /[0-9]/.test(password)
    && /[^a-zA-Z0-9]/.test(password);
}
