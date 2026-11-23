export function validateCheckout(fields) {
  const name = String(fields.name || '').trim();
  const email = String(fields.email || '').trim();
  const address = String(fields.address || '').trim();
  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = 'Enter your name (2–100 characters).';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address, such as name@example.com.';
  if (address.length < 8 || address.length > 500) errors.address = 'Enter a shipping address (8–500 characters).';
  return errors;
}
