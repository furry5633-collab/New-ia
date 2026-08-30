export function getUserAvatarUrl(email?: string, name?: string): string {
  if (email && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || cleanEmail
    )}&backgroundColor=d97706,b45309,78350f`;
  }

  const seed = name && name !== 'Invitado' ? name : 'Guest';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=44403c,292524`;
}
