export default function validatePassword(
  password: string,
  fullName: string
): string | null {
  const minLen = 10,
    maxLen = 20;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const [firstName = "", lastName = ""] = fullName.toLowerCase().split(" ");

  const containsName =
    (firstName.length > 3 && password.toLowerCase().includes(firstName)) ||
    (lastName.length > 3 && password.toLowerCase().includes(lastName));

  if (password.length < minLen || password.length > maxLen)
    return "Password must be 10–20 characters.";
  if (!hasUpper) return "Password must contain at least one uppercase.";
  if (!hasLower) return "Password must contain at least one lowercase.";
  if (!hasSpecial)
    return "Password must contain at least one special character.";
  if (!hasNumber) return "Password must contain at least one number.";
  if (containsName) return "Password must not contain your first or last name.";

  return null;
}
