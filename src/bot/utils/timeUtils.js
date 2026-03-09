export const isWithinQuietHours = (quietStart, quietEnd) => {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();

  const [sh, sm] = quietStart.split(':').map(Number);
  const [eh, em] = quietEnd.split(':').map(Number);

  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  if (quietStart === quietEnd) return false;

  // Same-day quiet window (e.g. 12:00–15:00)
  if (end > start) {
    return now >= start && now <= end;
  }

  // Overnight quiet window (e.g. 19:00–09:00)
  return now >= start || now <= end;
};
