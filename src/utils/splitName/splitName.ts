export function splitName(fullName?: string) {
  if (!fullName || typeof fullName !== 'string') {
    return {
      firstName: 'User',
      lastName: ' ',
    }
  }

  const parts = fullName.trim().split(/\s+/)

  // Single-word name (e.g. "Madonna")
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: ' ',
    }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}
